import { World, ParticleEffectConfig, ParticleConfigFile, Vector3 } from './types';
import { loadParticleConfig, validateConfig } from './ParticleConfigLoader';
import { ParticlePool } from './ParticlePool';
import { ParticlePatternRegistry } from './ParticlePatternsRegistry';
import { randomRange, randomDirectionWithinCone } from './utils';

export class ParticleEmitter {
  private world: World;
  private effectConfigs: { [name: string]: ParticleEffectConfig } = {};
  private pools: { [name: string]: ParticlePool } = {};
  private adaptivePerformance: boolean = true;
  private maxParticles: number = 500;
  private avgFps: number = 60;
  private lastUpdateTime: number = performance.now();

  constructor(world: World, config?: string | ParticleConfigFile) {
    this.world = world;
    if (config) {
      if (typeof config === 'string') {
        this.loadConfigFromFile(config);
      } else {
        this.applyConfig(config);
      }
    } else {
      this.applyConfig(this.getDefaultConfig());
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

  private applyConfig(configObj: ParticleConfigFile): void {
    const defaults = this.getDefaultConfig();
    const merged: ParticleConfigFile = { effects: {}, global: {} };

    // Merge global settings
    merged.global = { ...defaults.global, ...configObj.global };

    // Start with default effects
    for (const effectName in defaults.effects) {
      merged.effects[effectName] = { ...defaults.effects[effectName] };
    }

    // Merge with provided effects
    for (const effectName in configObj.effects) {
      let mergedEffect = { ...merged.effects[effectName], ...configObj.effects[effectName] };

      // Apply pattern if specified
      if (mergedEffect.pattern) {
        const patternName = mergedEffect.pattern as string;
        const patternFunc = ParticlePatternRegistry[patternName];
        if (patternFunc) {
          mergedEffect = { ...patternFunc(), ...mergedEffect };
          delete mergedEffect.pattern;
        }
      }
      merged.effects[effectName] = mergedEffect;
    }

    // Apply global settings
    if (merged.global) {
      this.adaptivePerformance = merged.global.adaptivePerformance !== false;
      if (merged.global.maxParticles) {
        this.maxParticles = merged.global.maxParticles;
      }
    }

    // Initialize effect pools
    this.effectConfigs = merged.effects;
    this.pools = {};
    for (const effectName in this.effectConfigs) {
      this.pools[effectName] = new ParticlePool();
    }
  }

  private getDefaultConfig(): ParticleConfigFile {
    return {
      effects: {
        explosion: ParticlePatternRegistry.explosion(),
        burst: ParticlePatternRegistry.burst(),
        hit: ParticlePatternRegistry.hit(),
      },
      global: {
        adaptivePerformance: true,
        maxParticles: 500,
      },
    };
  }

  emitEffect(effectName: string, position: Vector3, overrides?: Partial<ParticleEffectConfig>): void {
    const cfg = this.effectConfigs[effectName];
    if (!cfg) {
      console.warn(`Effect "${effectName}" not defined.`);
      return;
    }

    const effectiveCfg: ParticleEffectConfig = { ...cfg, ...overrides };
    let count = effectiveCfg.particleCount;

    if (this.adaptivePerformance) {
      const fpsRatio = Math.min(this.avgFps / 60, 1);
      count = Math.floor(count * fpsRatio) || 1;
    }

    for (let i = 0; i < count; i++) {
      if (this.getTotalActiveParticles() >= this.maxParticles) break;

      const pool = this.pools[effectName];
      const particle = pool.getParticle(
        effectiveCfg.model,
        effectiveCfg.size,
        effectiveCfg.usePhysics ?? false,
        effectiveCfg.gravity ?? true,
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
        effectiveCfg.usePhysics ?? false,
        effectiveCfg.gravity ?? true
      );
    }
  }

  update(deltaTime: number): void {
    const currentTime = performance.now();
    const actualDeltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;

    const currentFPS = actualDeltaTime > 0 ? (1 / actualDeltaTime) : 60;
    this.avgFps = 0.95 * this.avgFps + 0.05 * currentFPS;

    for (const effectName in this.pools) {
      const cfg = this.effectConfigs[effectName];
      this.pools[effectName].updateAll(deltaTime, cfg.usePhysics ?? false, cfg.gravity ?? true);
    }
  }

  private getTotalActiveParticles(): number {
    let total = 0;
    for (const effectName in this.pools) {
      total += this.pools[effectName].getActiveParticleCount();
    }
    return total;
  }
}