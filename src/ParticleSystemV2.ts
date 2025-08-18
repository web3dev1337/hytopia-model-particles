import { World, Entity } from 'hytopia';
import { ParticleSystemOptions, ParticleEffect, ParticleConfig, Vector3Like } from './types';
import { Particle } from './core/Particle';
import { ParticlePool } from './core/ParticlePool';
import { ParticleDataBuffer, ParticleFlags } from './optimization/ParticleDataBuffer';
import { SpatialOptimizer } from './optimization/SpatialOptimizer';
import { PhysicsForces } from './physics/PhysicsForces';
import { PerformanceMonitor } from './performance/PerformanceMonitor';
import { EffectQueue } from './queue/EffectQueue';
import { YAMLLoader } from './YAMLLoader';
import { Pattern } from './patterns/Pattern';
import { PatternRegistry } from './registry/PatternRegistry';

// Import built-in patterns
import { ExplosionPattern } from './patterns/ExplosionPattern';
import { StreamPattern } from './patterns/StreamPattern';
import { SpiralPattern } from './patterns/SpiralPattern';
import { WavePattern } from './patterns/WavePattern';
import { RingPattern } from './patterns/RingPattern';
import { FountainPattern } from './patterns/FountainPattern';

/**
 * ParticleSystem v2.2 - Enhanced with pooling, physics, and optimizations
 */
export class ParticleSystemV2 {
  private world: World;
  private particles: Map<Particle, number> = new Map(); // Particle -> update frame counter
  private effects: Map<string, ParticleEffect> = new Map();
  private maxParticles: number;
  private entityFactory?: (config: any) => Entity;
  
  // New v2.2 systems
  private pool?: ParticlePool;
  private dataBuffer?: ParticleDataBuffer;
  private spatialOptimizer?: SpatialOptimizer;
  private physicsForces?: PhysicsForces;
  
  // Existing systems
  private performanceMonitor?: PerformanceMonitor;
  private effectQueue: EffectQueue;
  private yamlLoader?: YAMLLoader;
  private patternRegistry: PatternRegistry;
  
  // Default effects
  private readonly DEFAULT_EFFECTS: Record<string, Partial<ParticleEffect>> = {
    explosion: {
      config: {
        modelUri: 'models/items/gold-nugget.gltf',
        modelScale: 0.3,
        lifetime: 1500,
        mass: 0.1,
        useGravity: true
      },
      count: 20,
      velocityMin: { x: -5, y: 2, z: -5 },
      velocityMax: { x: 5, y: 8, z: 5 }
    },
    spark: {
      config: {
        modelUri: 'models/items/gold-nugget.gltf',
        modelScale: 0.1,
        lifetime: 800,
        tintColor: { r: 255, g: 200, b: 100 }
      },
      count: 10
    },
    smoke: {
      config: {
        modelUri: 'models/items/gold-nugget.gltf',
        modelScale: { start: 0.2, end: 0.8 },
        lifetime: 2000,
        opacity: { start: 0.8, end: 0 },
        tintColor: { r: 150, g: 150, b: 150 }
      },
      count: 15
    }
  };
  
  constructor(world: World, options: ParticleSystemOptions = {}) {
    this.world = world;
    this.maxParticles = options.maxParticles || 500;
    this.entityFactory = options.entityFactory;
    
    // Initialize effect queue
    this.effectQueue = new EffectQueue(options.maxParticles || 500);
    
    // Initialize pattern registry and register built-in patterns
    this.patternRegistry = PatternRegistry.getInstance();
    this.registerBuiltInPatterns();
    
    // Initialize v2.2 systems based on options
    if (options.poolSize || options.performance?.enablePooling !== false) {
      const defaultConfig: ParticleConfig = {
        modelUri: 'models/items/gold-nugget.gltf',
        modelScale: 0.3,
        lifetime: 2000
      };
      this.pool = new ParticlePool(
        options.poolSize || Math.min(100, this.maxParticles),
        defaultConfig,
        this.entityFactory
      );
    }
    
    if (options.performance?.enableSpatialOptimization) {
      this.spatialOptimizer = new SpatialOptimizer(
        options.performance.updateRadius || 50
      );
    }
    
    if (options.physics?.enableForces !== false) {
      this.physicsForces = new PhysicsForces();
      if (options.physics?.globalWind) {
        this.physicsForces.setGlobalWind(options.physics.globalWind);
      }
      if (options.physics?.turbulence !== undefined) {
        this.physicsForces.setTurbulence(options.physics.turbulence);
      }
    }
    
    // Data buffer for efficient tracking
    this.dataBuffer = new ParticleDataBuffer(this.maxParticles);
    
    // Performance monitoring
    if (options.performance) {
      this.performanceMonitor = new PerformanceMonitor(
        options.performance,
        (metrics) => this.onPerformanceUpdate(metrics)
      );
    }
    
    // YAML loader
    if (options.configPath) {
      this.yamlLoader = new YAMLLoader(options.configPath);
      this.loadYAMLEffects();
    }
    
    // Register default effects
    this.registerDefaultEffects();
    
    // Start update loop
    if (this.performanceMonitor) {
      this.performanceMonitor.startMonitoring();
    }
    
    // Start particle update loop
    setInterval(() => this.updateParticles(), 16); // ~60 FPS
  }
  
  private registerBuiltInPatterns(): void {
    this.patternRegistry.register('explosion', new ExplosionPattern({}));
    this.patternRegistry.register('stream', new StreamPattern());
    this.patternRegistry.register('spiral', new SpiralPattern());
    this.patternRegistry.register('wave', new WavePattern());
    this.patternRegistry.register('ring', new RingPattern());
    this.patternRegistry.register('fountain', new FountainPattern());
  }
  
  private registerDefaultEffects(): void {
    Object.entries(this.DEFAULT_EFFECTS).forEach(([name, effect]) => {
      this.effects.set(name, {
        name,
        config: effect.config!,
        count: effect.count!,
        ...effect
      } as ParticleEffect);
    });
  }
  
  private loadYAMLEffects(): void {
    if (!this.yamlLoader) return;
    
    try {
      const effects = this.yamlLoader.loadEffects();
      effects.forEach(effect => {
        this.effects.set(effect.name, effect);
      });
    } catch (error) {
      console.warn('Failed to load YAML effects:', error);
    }
  }
  
  /**
   * Quick effect registration with minimal config
   */
  quickEffect(name: string, options: {
    modelUri?: string;
    model?: string;
    count?: number;
    pattern?: string;
    lifetime?: number;
    scale?: number;
  } = {}): void {
    const effect: ParticleEffect = {
      name,
      config: {
        modelUri: options.modelUri || (options.model === 'default' ? 'models/items/gold-nugget.gltf' : (options.model || 'models/items/gold-nugget.gltf')),
        modelScale: options.scale || 0.3,
        lifetime: options.lifetime || 2000
      },
      count: options.count || 20,
      pattern: options.pattern
    };
    
    this.effects.set(name, effect);
  }
  
  /**
   * Register a full effect configuration
   */
  registerEffect(effect: ParticleEffect): void {
    this.effects.set(effect.name, effect);
  }
  
  /**
   * Spawn particles with simple API
   */
  spawn(effectName: string, position: Vector3Like, options?: {
    priority?: number;
    count?: number;
    pattern?: string;
    velocity?: Vector3Like;
  }): void {
    const effect = this.effects.get(effectName);
    if (!effect) {
      console.warn(`Effect '${effectName}' not registered`);
      return;
    }
    
    // Use options to override effect settings
    const finalEffect = {
      ...effect,
      count: options?.count || effect.count,
      pattern: options?.pattern || effect.pattern
    };
    
    // Queue the effect
    this.effectQueue.enqueue(
      effectName,
      position,
      options?.priority || 5,
      options
    );
    
    // Process queue
    this.processEffectQueue();
  }
  
  private processEffectQueue(): void {
    const maxPerFrame = 50; // Limit particles spawned per frame
    let spawned = 0;
    
    while (spawned < maxPerFrame && this.particles.size < this.maxParticles) {
      const queued = this.effectQueue.dequeue();
      if (!queued) break;
      
      const effect = this.effects.get(queued.effectName);
      if (!effect) continue;
      
      this.spawnEffect(effect, queued.position, queued.options);
      spawned += effect.count;
    }
  }
  
  private spawnEffect(effect: ParticleEffect, position: Vector3Like, options?: any): void {
    const pattern = effect.pattern ? 
      this.patternRegistry.get(effect.pattern) : 
      this.patternRegistry.get('explosion');
    
    if (!pattern) return;
    
    
    const particles = pattern.generate(
      effect.config,
      position,
      effect.count,
      {
        ...effect,
        ...effect.patternModifiers,
        ...options
      }
    );
    
    particles.forEach((particleData, index) => {
      this.spawnParticle(
        particleData.config,
        particleData.position,
        particleData.velocity,
        particleData.angularVelocity
      );
    });
  }
  
  private spawnParticle(
    config: ParticleConfig,
    position: Vector3Like,
    velocity?: Vector3Like,
    angularVelocity?: Vector3Like
  ): void {
    if (this.particles.size >= this.maxParticles) return;
    
    let particle: Particle | null = null;
    
    // Try to get from pool first
    if (this.pool) {
      particle = this.pool.acquire(config);
    }
    
    // Create new if no pool or pool is empty
    if (!particle) {
      particle = new Particle(config, this.entityFactory);
    }
    
    // Allocate buffer index
    if (this.dataBuffer && particle.bufferIndex === -1) {
      particle.bufferIndex = this.dataBuffer.allocate();
    }
    
    // Store velocities in buffer
    if (this.dataBuffer && particle.bufferIndex !== -1) {
      if (velocity) {
        this.dataBuffer.setVelocity(particle.bufferIndex, velocity.x, velocity.y, velocity.z);
      }
      if (angularVelocity) {
        this.dataBuffer.setAngularVelocity(particle.bufferIndex, angularVelocity.x, angularVelocity.y, angularVelocity.z);
      }
      this.dataBuffer.setFlag(particle.bufferIndex, ParticleFlags.ACTIVE, true);
      this.dataBuffer.setFlag(particle.bufferIndex, ParticleFlags.PHYSICS_ENABLED, !!config.mass);
    }
    
    // Apply physics forces if enabled
    let finalVelocity = velocity;
    if (this.physicsForces && velocity) {
      const forces = this.physicsForces.calculateForces(position);
      finalVelocity = {
        x: velocity.x + forces.x,
        y: velocity.y + forces.y,
        z: velocity.z + forces.z
      };
    }
    
    particle.spawn(this.world, position, finalVelocity, angularVelocity);
    this.particles.set(particle, 0);
  }
  
  private updateParticles(): void {
    const now = Date.now();
    const toRemove: Particle[] = [];
    
    // Update player positions for spatial optimization
    if (this.spatialOptimizer && this.world.entityManager) {
      const playerEntities = this.world.entityManager.getAllPlayerEntities();
      const playerPositions = playerEntities
        .filter(pe => pe.position)
        .map(pe => pe.position!);
      this.spatialOptimizer.setPlayerPositions(playerPositions);
    }
    
    // Update particles
    this.particles.forEach((frameCounter, particle) => {
      // Check spatial optimization
      if (this.spatialOptimizer) {
        const lod = this.spatialOptimizer.getParticleLOD(particle);
        const updateFreq = this.spatialOptimizer.getUpdateFrequency(lod);
        
        if (updateFreq === 0 || frameCounter % updateFreq !== 0) {
          // Skip this frame
          this.particles.set(particle, frameCounter + 1);
          return;
        }
      }
      
      // Apply physics forces
      if (this.physicsForces && this.dataBuffer && particle.bufferIndex !== -1) {
        const isPhysicsEnabled = this.dataBuffer.getFlag(particle.bufferIndex, ParticleFlags.PHYSICS_ENABLED);
        if (isPhysicsEnabled && particle.position) {
          const forces = this.physicsForces.calculateForces(particle.position);
          const entity = (particle as any).entity;
          if (entity && entity.isSpawned && (forces.x !== 0 || forces.y !== 0 || forces.z !== 0)) {
            try {
              entity.applyImpulse({
                x: forces.x * 0.016, // Delta time approximation
                y: forces.y * 0.016,
                z: forces.z * 0.016
              });
            } catch (e) {
              // Ignore physics errors
            }
          }
        }
      }
      
      // Update particle
      if (!particle.update()) {
        toRemove.push(particle);
      }
      
      // Update frame counter
      this.particles.set(particle, frameCounter + 1);
    });
    
    // Remove dead particles
    toRemove.forEach(particle => {
      this.particles.delete(particle);
      
      // Release buffer
      if (this.dataBuffer && particle.bufferIndex !== -1) {
        this.dataBuffer.release(particle.bufferIndex);
        particle.bufferIndex = -1;
      }
      
      // Return to pool or despawn
      if (this.pool) {
        this.pool.release(particle);
      } else {
        if (particle.active) {
          particle.despawn();
        }
      }
    });
    
    // Update performance metrics
    if (this.performanceMonitor) {
      this.performanceMonitor.recordFrame();
    }
  }
  
  private onPerformanceUpdate(metrics: any): void {
    // Add pool and buffer stats
    if (this.pool) {
      metrics.poolStats = this.pool.getStats();
    }
    if (this.dataBuffer) {
      metrics.bufferStats = this.dataBuffer.getStats();
    }
  }
  
  /**
   * Add physics effects
   */
  setGlobalWind(wind: Vector3Like): void {
    this.physicsForces?.setGlobalWind(wind);
  }
  
  setTurbulence(strength: number): void {
    this.physicsForces?.setTurbulence(strength);
  }
  
  addVortex(position: Vector3Like, strength: number, radius: number): void {
    this.physicsForces?.addVortex(position, strength, radius);
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport(): any {
    const base: any = this.performanceMonitor?.getMetrics() || {
      currentFPS: 60,
      averageFPS: 60,
      particleCount: 0,
      poolSize: 0,
      qualityLevel: 'high',
      droppedFrames: 0,
      lastFrameTime: Date.now()
    };
    
    // Add v2.2 stats
    if (this.pool) {
      base.poolStats = this.pool.getStats();
    }
    if (this.dataBuffer) {
      base.bufferStats = this.dataBuffer.getStats();
    }
    
    base.particleCount = this.particles.size;
    
    return base;
  }
  
  /**
   * Clean up
   */
  dispose(): void {
    this.performanceMonitor?.stopMonitoring();
    
    // Clear all particles
    this.particles.forEach((frameCounter, particle) => {
      if (this.pool) {
        this.pool.release(particle);
      } else {
        if (particle.active) {
          particle.despawn();
        }
      }
    });
    this.particles.clear();
    
    // Clear pool
    this.pool?.clear();
    
    // Clear vortices
    this.physicsForces?.clearVortices();
  }
}