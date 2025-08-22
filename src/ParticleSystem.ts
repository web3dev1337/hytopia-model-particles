import { World, Entity } from 'hytopia';
import type { Vector3Like } from 'hytopia';
import { Particle } from './Particle';
import { ParticleConfig, ParticleEffect, ParticleSystemOptions } from './types';
import { Pattern } from './patterns/Pattern';
import { PatternRegistry } from './registry/PatternRegistry';
import { PerformanceMonitor } from './performance/PerformanceMonitor';
import { EffectQueue } from './queue/EffectQueue';
import { EnhancedYAMLLoader } from './config/EnhancedYAMLLoader';

export class ParticleSystem {
  private world: World;
  private particles: Particle[] = [];
  private activeParticles: Set<Particle> = new Set();
  private maxParticles: number;
  private lastCleanup: number = 0;
  private cleanupInterval: number;
  private effects: Map<string, ParticleEffect> = new Map();
  private patterns: PatternRegistry;
  private performanceMonitor?: PerformanceMonitor;
  private effectQueue?: EffectQueue;
  private yamlLoader?: EnhancedYAMLLoader;
  private entityFactory?: (config: any) => Entity;
  private debug: boolean;
  private updateInterval?: NodeJS.Timeout;

  constructor(world: World, options: ParticleSystemOptions = {}) {
    this.world = world;
    this.maxParticles = options.maxParticles || 500;
    this.cleanupInterval = options.cleanupInterval || 1000;
    this.entityFactory = options.entityFactory;
    this.debug = options.debug || false;
    
    // Initialize pattern registry
    this.patterns = PatternRegistry.getInstance();
    
    // Initialize performance monitor if enabled
    if (options.performance) {
      this.performanceMonitor = new PerformanceMonitor(options.performance);
    }
    
    // Initialize effect queue
    this.effectQueue = new EffectQueue();
    
    // Initialize YAML loader
    if (options.configPath || options.enableHotReload) {
      this.yamlLoader = new EnhancedYAMLLoader(options.enableHotReload || false);
      
      if (options.configPath) {
        this.yamlLoader.loadDirectory(options.configPath);
        
        // Register loaded effects
        const loadedEffects = this.yamlLoader.getAllEffects();
        for (const [name, effect] of loadedEffects) {
          this.registerEffect(effect);
        }
      }
    }
    
    // Start cleanup loop if enabled
    if (options.autoCleanup !== false) {
      this.startCleanupLoop();
    }
    
    // Register built-in effects
    this.registerBuiltInEffects();
  }
  
  /**
   * Register built-in particle effects that come with the plugin
   */
  private registerBuiltInEffects(): void {
    // Traditional wall impact effect (simple, minimal movement like original HyFire)
    this.registerEffect({
      name: 'wall_impact_traditional',
      config: {
        modelUri: 'models/items/gold-nugget.gltf',
        lifetime: 2000,
        mass: 0.76,
        useGravity: true,
        gravityScale: 1.0,
        modelScale: 0.081,
        tintColor: { r: 0, g: 0, b: 0 },
        ccdEnabled: true // Enable CCD for collision detection
      },
      count: 2,
      // Very tiny movement - much smaller than before
      velocityMin: { x: -0.05, y: 0.01, z: -0.05 },
      velocityMax: { x: 0.05, y: 0.03, z: 0.05 }
    });
    
    // Enhanced wall impact effect (animated sparks)
    this.registerEffect({
      name: 'wall_impact_sparks',
      config: {
        modelUri: 'models/items/gold-nugget.gltf',
        lifetime: 1500,
        mass: 0.05,
        useGravity: true,
        gravityScale: 1.5,
        ccdEnabled: true, // Enable CCD for collision detection
        animations: {
          scaleOverTime: {
            start: 0.8,
            end: 0.1,
            curve: { type: 'easeOut' }
          },
          colorOverTime: {
            type: 'smooth',
            keyframes: [
              { time: 0, color: { r: 255, g: 255, b: 200 } },
              { time: 0.3, color: { r: 255, g: 150, b: 50 } },
              { time: 0.7, color: { r: 200, g: 50, b: 20 } },
              { time: 1.0, color: { r: 100, g: 20, b: 10 } }
            ]
          },
          opacityOverTime: {
            start: 1.0,
            end: 0.0,
            curve: { type: 'easeIn' }
          }
        }
      },
      count: 15,
      pattern: 'explosion',
      patternModifiers: {
        intensity: 0.8,
        spread: 1.2
      }
    });
  }

  registerEffect(effect: ParticleEffect): void {
    console.log('🔧 PLUGIN DEBUG: Registering effect:', effect.name, effect);
    this.effects.set(effect.name, effect);
    console.log('🔧 PLUGIN DEBUG: Effect registered. Total effects:', this.effects.size);
    console.log('🔧 PLUGIN DEBUG: All registered effects:', Array.from(this.effects.keys()));
  }

  registerPattern(name: string, pattern: Pattern): void {
    this.patterns.registerPattern(name, pattern);
  }

  /**
   * Spawn particles with effect or pattern
   */
  spawn(effectName: string, position: Vector3Like, options: any = {}): void {
    console.log('🔧 PLUGIN DEBUG: spawn() called with effect:', effectName, 'position:', position);
    
    // Process through queue if performance monitoring is enabled
    if (this.performanceMonitor) {
      console.log('🔧 PLUGIN DEBUG: Using performance monitor queue');
      const priority = options.priority || 0;
      this.effectQueue?.enqueue(effectName, position, priority, options);
      return;
    }
    
    console.log('🔧 PLUGIN DEBUG: Direct spawn mode');
    // Direct spawn
    this.spawnDirect(effectName, position, options);
  }
  
  /**
   * Direct spawn bypassing queue
   */
  private spawnDirect(effectName: string, position: Vector3Like, options: any = {}): void {
    console.log('🔧 PLUGIN DEBUG: spawnDirect() called for effect:', effectName);
    console.log('🔧 PLUGIN DEBUG: Available effects:', Array.from(this.effects.keys()));
    
    const effect = this.effects.get(effectName);
    if (!effect) {
      console.error('🔧 PLUGIN DEBUG: Effect not found!', effectName, 'Available:', Array.from(this.effects.keys()));
      if (this.debug) {
        console.warn(`Particle effect '${effectName}' not found`);
      }
      return;
    }
    
    console.log('🔧 PLUGIN DEBUG: Effect found:', effect);
    
    // Check performance limits
    if (this.performanceMonitor && !this.performanceMonitor.shouldSpawnParticle()) {
      console.log('🔧 PLUGIN DEBUG: Performance monitor blocked spawn');
      return;
    }
    
    console.log('🔧 PLUGIN DEBUG: About to spawn with pattern...');
    // Use pattern if specified
    if (effect.pattern) {
      this.spawnWithPattern(
        effect.pattern,
        effect.config,
        position,
        { ...effect.patternModifiers, ...options }
      );
    } else {
      this.spawnEffect(effect, position, options);
    }
  }

  spawnWithPattern(
    patternName: string, 
    config: ParticleConfig, 
    position: Vector3Like, 
    modifiers: Record<string, any> = {}
  ): void {
    const pattern = this.patterns.getPattern(patternName);
    if (!pattern) {
      if (this.debug) {
        console.warn(`Pattern '${patternName}' not found`);
      }
      return;
    }
    
    // Apply performance scaling
    if (this.performanceMonitor) {
      const scaleModifier = this.performanceMonitor.getParticleScaleModifier();
      if (typeof config.modelScale === 'number') {
        config.modelScale *= scaleModifier;
      }
    }
    
    // Apply modifiers to pattern
    pattern.applyModifiers(modifiers);
    
    const points = pattern.generatePoints();
    const velocities = pattern.generateVelocities();
    
    for (let i = 0; i < points.length; i++) {
      const particle = this.getOrCreateParticle(config);
      if (!particle) break;
      
      const spawnPos = {
        x: position.x + points[i].x,
        y: position.y + points[i].y,
        z: position.z + points[i].z
      };
      
      particle.spawn(this.world, spawnPos, velocities[i]);
      this.activeParticles.add(particle);
    }
  }

  private spawnEffect(effect: ParticleEffect, position: Vector3Like, options: any): void {
    const count = options.count || effect.count;
    const spread = options.spread || effect.spread || 1;
    
    // Apply performance scaling
    let actualCount = count;
    if (this.performanceMonitor) {
      const quality = this.performanceMonitor.getCurrentQualitySettings();
      actualCount = Math.floor(count * (quality.maxParticles / this.maxParticles));
    }
    
    for (let i = 0; i < actualCount; i++) {
      const particle = this.getOrCreateParticle(effect.config);
      if (!particle) break;
      
      // Calculate spawn position with spread
      const offset = {
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread
      };
      
      const spawnPos = {
        x: position.x + offset.x,
        y: position.y + offset.y,
        z: position.z + offset.z
      };
      
      // Calculate velocity
      let velocity: Vector3Like | undefined;
      if (effect.velocityMin && effect.velocityMax) {
        velocity = {
          x: effect.velocityMin.x + Math.random() * (effect.velocityMax.x - effect.velocityMin.x),
          y: effect.velocityMin.y + Math.random() * (effect.velocityMax.y - effect.velocityMin.y),
          z: effect.velocityMin.z + Math.random() * (effect.velocityMax.z - effect.velocityMin.z)
        };
      }
      
      // Calculate angular velocity
      let angularVelocity: Vector3Like | undefined;
      if (effect.angularVelocityMin && effect.angularVelocityMax) {
        angularVelocity = {
          x: effect.angularVelocityMin.x + Math.random() * (effect.angularVelocityMax.x - effect.angularVelocityMin.x),
          y: effect.angularVelocityMin.y + Math.random() * (effect.angularVelocityMax.y - effect.angularVelocityMin.y),
          z: effect.angularVelocityMin.z + Math.random() * (effect.angularVelocityMax.z - effect.angularVelocityMin.z)
        };
      }
      
      // Apply lifetime variation
      if (effect.lifetimeVariation && effect.config.lifetime) {
        const variation = effect.lifetimeVariation;
        const lifetime = effect.config.lifetime;
        particle.reset({
          lifetime: lifetime + (Math.random() - 0.5) * lifetime * variation
        });
      }
      
      particle.spawn(this.world, spawnPos, velocity, angularVelocity);
      this.activeParticles.add(particle);
    }
  }

  private getOrCreateParticle(config: ParticleConfig): Particle | null {
    // Try to reuse inactive particle
    for (const particle of this.particles) {
      if (!particle.active) {
        particle.reset(config);
        return particle;
      }
    }
    
    // Create new particle if under limit
    if (this.particles.length < this.maxParticles) {
      const particle = new Particle(config, this.entityFactory);
      this.particles.push(particle);
      return particle;
    }
    
    return null;
  }

  update(): void {
    const now = Date.now();
    
    // Process effect queue
    if (this.effectQueue) {
      const toSpawn = this.effectQueue.process();
      for (const effect of toSpawn) {
        this.spawnDirect(effect.effectName, effect.position, effect.options);
      }
    }
    
    // Update active particles
    for (const particle of this.activeParticles) {
      if (!particle.update()) {
        this.activeParticles.delete(particle);
      }
    }
    
    // Update performance monitor
    if (this.performanceMonitor) {
      this.performanceMonitor.update(this.activeParticles.size, this.particles.length);
    }
    
    // Periodic cleanup
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  private cleanup(): void {
    // Remove completely inactive particles that haven't been used in a while
    if (this.particles.length > this.maxParticles * 0.8) {
      const inactiveCount = this.particles.filter(p => !p.active).length;
      if (inactiveCount > this.maxParticles * 0.3) {
        // Remove some inactive particles
        this.particles = this.particles.filter(p => p.active || Math.random() > 0.5);
      }
    }
  }

  private startCleanupLoop(): void {
    this.updateInterval = setInterval(() => this.update(), 16); // ~60fps update rate
  }

  despawnAll(): void {
    for (const particle of this.activeParticles) {
      particle.despawn();
    }
    this.activeParticles.clear();
  }
  
  /**
   * Stop the particle system and clean up resources
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.despawnAll();
    
    if (this.yamlLoader) {
      this.yamlLoader.stopWatching();
    }
  }

  get activeCount(): number {
    return this.activeParticles.size;
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport(): string | undefined {
    return this.performanceMonitor?.getReport();
  }
  
  /**
   * Get effect queue status
   */
  getQueueStatus(): any {
    return this.effectQueue?.getStatus();
  }
}