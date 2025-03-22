import { World, ParticleEffectConfig, ParticleConfigFile, Vector3, PerformanceMetrics, CleanupStats } from '../types';
import { loadParticleConfig, validateConfig } from '../config/ParticleConfigLoader';
import { ParticlePool } from '../core/ParticlePool';
import { ParticlePatternRegistry } from '../patterns/ParticlePatternsRegistry';
import { randomRange, randomDirectionWithinCone } from '../utils/utils';
import { ParticleEffectQueue } from '../lifecycle/ParticleEffectQueue';

const FPS_HISTORY_SIZE = 60; // Keep track of last 60 frames (1 second at 60fps)
const TARGET_FPS = 60;
const FRAME_TIME_TARGET = 1000 / TARGET_FPS;
const PERFORMANCE_SMOOTHING = 0.95; // How smooth the performance adaptation should be

export class ParticleEmitter {
  private world: World;
  private effectConfigs: { [name: string]: ParticleEffectConfig } = {};
  private pools: { [name: string]: ParticlePool } = {};
  private effectQueue: ParticleEffectQueue;
  private adaptivePerformance: boolean = true;
  private maxParticles: number = 500;
  private avgFps: number = 60;
  private lastUpdateTime: number = performance.now();

  // Performance monitoring
  private metrics: PerformanceMetrics = {
    lastFrameTime: performance.now(),
    frameCount: 0,
    averageFrameTime: FRAME_TIME_TARGET,
    particleReductionFactor: 1.0,
    activeParticleCount: 0,
    poolSize: 0,
    fpsHistory: new Array(FPS_HISTORY_SIZE).fill(TARGET_FPS),
    droppedFrames: 0
  };

  constructor(world: World, config?: string | ParticleConfigFile) {
    this.world = world;
    this.effectQueue = new ParticleEffectQueue({
      maxQueueSize: 1000,
      batchSize: 10,
      maxEffectsPerFrame: Math.floor(this.maxParticles * 0.1),
      defaultMaxAge: 1000
    });

    // Initialize pools with default options
    const defaultPoolOptions = {
      cellSize: 10,
      sleepDistance: 100,
      cleanupCheckInterval: 1000,
      bounds: {
        min: { x: -1000, y: -1000, z: -1000 },
        max: { x: 1000, y: 1000, z: 1000 }
      }
    };

    if (config) {
      if (typeof config === 'string') {
        this.loadConfigFromFile(config);
      } else {
        this.applyConfig(config, defaultPoolOptions);
      }
    } else {
      this.applyConfig(this.getDefaultConfig(), defaultPoolOptions);
    }
  }

  static fromYaml(configFilePath: string, world: World): ParticleEmitter {
    return new ParticleEmitter(world, configFilePath);
  }

  private loadConfigFromFile(filePath: string): void {
    try {
      const configObj = loadParticleConfig(filePath);
      validateConfig(configObj);
      this.applyConfig(configObj);
    } catch (err) {
      console.error('Error loading config, using defaults:', err);
      this.applyConfig(this.getDefaultConfig());
    }
  }

  private applyConfig(configObj: ParticleConfigFile, poolOptions?: any): void {
    const defaults = this.getDefaultConfig();
    const merged: ParticleConfigFile = { effects: {}, global: {} };

    // Merge global settings
    merged.global = { ...defaults.global, ...configObj.global };

    // Apply global settings
    if (merged.global) {
      this.adaptivePerformance = merged.global.adaptivePerformance !== false;
      if (merged.global.maxParticles) {
        this.maxParticles = merged.global.maxParticles;
      }

      // Update pool options if provided in global config
      if (poolOptions && merged.global.poolOptions) {
        Object.assign(poolOptions, merged.global.poolOptions);
      }
    }

    // Initialize effect pools with options
    this.effectConfigs = merged.effects;
    this.pools = {};
    for (const effectName in this.effectConfigs) {
      this.pools[effectName] = new ParticlePool(poolOptions);
    }
  }

  private getDefaultConfig(): ParticleConfigFile {
    return {
      effects: {
        explosion: {
          ...ParticlePatternRegistry.generateConfig('explosion'),
          pattern: 'explosion'
        },
        stream: {
          ...ParticlePatternRegistry.generateConfig('stream'),
          pattern: 'stream'
        },
        spark: {
          ...ParticlePatternRegistry.generateConfig('spark'),
          pattern: 'spark'
        }
      },
      global: {
        adaptivePerformance: true,
        maxParticles: 500,
      },
    };
  }

  queueEffect(
    effectName: string,
    position: Vector3,
    overrides?: Partial<ParticleEffectConfig>,
    options?: {
      priority?: number;
      maxAge?: number;
      batchKey?: string;
    }
  ): boolean {
    if (!this.effectConfigs[effectName]) {
      console.warn(`Effect "${effectName}" not defined.`);
      return false;
    }

    return this.effectQueue.enqueue(effectName, position, overrides, options);
  }

  private emitQueuedEffects(): void {
    const effects = this.effectQueue.dequeueEffects();
    for (const effect of effects) {
      this.emitEffect(effect.effectName, effect.position, effect.overrides);
    }
  }

  emitEffect(effectName: string, position: Vector3, overrides?: Partial<ParticleEffectConfig>): void {
    // First try to get the pattern directly if this is a pattern name
    const pattern = ParticlePatternRegistry.getPattern(effectName);
    if (pattern) {
      const config = pattern.generate(overrides);
      this.effectConfigs[effectName] = config;
      this.pools[effectName] = this.pools[effectName] || new ParticlePool();
    }

    const cfg = this.effectConfigs[effectName];
    if (!cfg) {
      console.warn(`Effect "${effectName}" not defined.`);
      return;
    }

    const effectiveCfg: ParticleEffectConfig = { ...cfg };
    
    // Apply pattern and overrides
    if (overrides?.pattern || cfg.pattern) {
      const patternName = overrides?.pattern || cfg.pattern;
      if (patternName) {
        const pattern = ParticlePatternRegistry.getPattern(patternName);
        if (pattern) {
          Object.assign(effectiveCfg, pattern.generate({
            ...cfg,
            ...overrides,
          }));
        }
      }
    } else {
      Object.assign(effectiveCfg, overrides);
    }

    // Apply performance-based particle reduction
    let count = Math.max(1, Math.floor(
      effectiveCfg.particleCount * this.metrics.particleReductionFactor
    ));

    for (let i = 0; i < count; i++) {
      if (this.getTotalActiveParticles() >= this.maxParticles) break;

      const pool = this.pools[effectName];
      const particle = pool.getParticle(
        effectiveCfg.model || 'models/default-particle.gltf',
        effectiveCfg.size,
        effectiveCfg.physics?.enabled ? effectiveCfg.physics.rigidBody : undefined,
        this.maxParticles
      );

      if (!particle) continue;

      const initSpeed = randomRange(effectiveCfg.speed.min, effectiveCfg.speed.max);
      const baseDir = effectiveCfg.direction || null;
      const dir = randomDirectionWithinCone(baseDir, effectiveCfg.spread);
      const velocity = {
        x: dir.x * initSpeed,
        y: dir.y * initSpeed,
        z: dir.z * initSpeed,
      };

      particle.spawn(
        this.world,
        position,
        velocity,
        effectiveCfg.lifetime,
        effectiveCfg.physics?.rigidBody
      );
    }
  }

  update(deltaTime: number): void {
    const currentTime = performance.now();
    const actualDeltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;

    // Update performance metrics
    this.updatePerformanceMetrics(currentTime, actualDeltaTime);

    // Process queued effects
    this.emitQueuedEffects();

    // Update particles
    for (const effectName in this.pools) {
      this.pools[effectName].updateAll(deltaTime);
    }

    // Update metrics
    this.metrics.activeParticleCount = this.getTotalActiveParticles();
    this.metrics.poolSize = Object.values(this.pools).reduce((total, pool) => total + pool.getTotalParticleCount(), 0);
  }

  private updatePerformanceMetrics(currentTime: number, deltaTime: number): void {
    const frameTime = currentTime - this.metrics.lastFrameTime;
    this.metrics.frameCount++;

    // Update FPS history
    const currentFPS = 1000 / frameTime;
    this.metrics.fpsHistory.push(currentFPS);
    this.metrics.fpsHistory.shift();

    // Calculate average frame time with smoothing
    this.metrics.averageFrameTime = 
      (this.metrics.averageFrameTime * PERFORMANCE_SMOOTHING) + 
      (frameTime * (1 - PERFORMANCE_SMOOTHING));

    // Track dropped frames
    if (frameTime > FRAME_TIME_TARGET * 1.5) { // If frame took 50% longer than target
      this.metrics.droppedFrames++;
    }

    // Adjust particle reduction factor based on performance
    if (this.adaptivePerformance) {
      if (this.metrics.averageFrameTime > FRAME_TIME_TARGET) {
        // Reduce particles if we're not hitting target frame time
        this.metrics.particleReductionFactor *= 0.95;
      } else if (this.metrics.averageFrameTime < FRAME_TIME_TARGET * 0.8) {
        // Increase particles if we have headroom (but don't exceed 1.0)
        this.metrics.particleReductionFactor = Math.min(
          1.0,
          this.metrics.particleReductionFactor * 1.05
        );
      }
    }

    this.metrics.lastFrameTime = currentTime;
  }

  // Add method to get current performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics }; // Return a copy to prevent external modification
  }

  private getTotalActiveParticles(): number {
    let total = 0;
    for (const effectName in this.pools) {
      total += this.pools[effectName].getActiveParticleCount();
    }
    return total;
  }

  getQueueStats() {
    return this.effectQueue.getQueueStats();
  }

  clearQueue(): void {
    this.effectQueue.clear();
  }

  setCameraPosition(position: Vector3): void {
    for (const pool of Object.values(this.pools)) {
      pool.setCameraPosition(position);
    }
  }

  setWorldBounds(min: Vector3, max: Vector3): void {
    for (const pool of Object.values(this.pools)) {
      pool.setWorldBounds(min, max);
    }
  }

  setSleepDistance(distance: number): void {
    for (const pool of Object.values(this.pools)) {
      pool.setSleepDistance(distance);
    }
  }

  getCleanupStats(): { [effectName: string]: CleanupStats } {
    const stats: { [effectName: string]: CleanupStats } = {};
    for (const [effectName, pool] of Object.entries(this.pools)) {
      stats[effectName] = pool.getCleanupStats();
    }
    return stats;
  }

  cleanup(): void {
    // Cleanup all particle pools
    for (const pool of Object.values(this.pools)) {
      pool.dispose();
    }
    this.pools = {};
    this.effectConfigs = {};
  }
}