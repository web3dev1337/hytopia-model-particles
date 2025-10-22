import { Particle } from './Particle';
import { ParticleConfig } from '../types';
import { World } from 'hytopia';

/**
 * Object pool for particle reuse to minimize garbage collection
 * v2.3: True entity pooling - keeps entities spawned in world
 */
export class ParticlePool {
  private availableParticles: Particle[] = [];
  private activeParticles: Set<Particle> = new Set();
  private readonly poolSize: number;
  private readonly growthFactor: number = 1.5;
  private totalCreated: number = 0;
  private world?: World;
  private targetPoolSize: number = 50; // Further reduced to 50 for testing
  private spawnPerTick: number = 10; // Spawn 10 per tick
  private isBuilding: boolean = false;
  
  constructor(
    poolSize: number = 100,
    private defaultConfig: ParticleConfig,
    private entityFactory?: (config: any) => any,
    world?: World,
    preBuildSize?: number
  ) {
    this.poolSize = poolSize;
    this.world = world;
    this.targetPoolSize = preBuildSize !== undefined ? preBuildSize : 50;
    // Start with empty pool - will build gradually only if preBuildSize > 0
    if (world && this.targetPoolSize > 0) {
      this.startGradualPoolBuilding();
    }
  }
  
  /**
   * Initialize pool with world reference for true entity pooling
   */
  public initializeWithWorld(world: World): void {
    this.world = world;
    if (!this.isBuilding) {
      this.startGradualPoolBuilding();
    }
  }
  
  /**
   * Gradually build the pool over time to avoid FPS drops
   */
  private startGradualPoolBuilding(): void {
    if (this.isBuilding || !this.world) return;
    
    this.isBuilding = true;
    console.log(`🏗️ Starting gradual pool building: ${this.spawnPerTick} entities per tick, target: ${this.targetPoolSize}`);
    
    // Use setInterval to spawn entities gradually
    const buildInterval = setInterval(() => {
      if (!this.world || this.totalCreated >= this.targetPoolSize) {
        clearInterval(buildInterval);
        this.isBuilding = false;
        console.log(`✅ Pool building complete: ${this.totalCreated} entities pre-spawned`);
        return;
      }
      
      // Spawn batch of entities this tick
      const batchSize = Math.min(this.spawnPerTick, this.targetPoolSize - this.totalCreated);
      
      for (let i = 0; i < batchSize; i++) {
        const particle = new Particle(this.defaultConfig, this.entityFactory);
        
        // Pre-spawn with physics disabled
        (particle as any).initializeInWorld(this.world);
        
        this.availableParticles.push(particle);
        this.totalCreated++;
      }
      
      // Log progress every 100 entities
      if (this.totalCreated % 100 === 0) {
        console.log(`🏊 Pool progress: ${this.totalCreated}/${this.targetPoolSize} entities`);
      }
    }, 16); // Run every tick (~16ms)
  }
  
  acquire(config?: Partial<ParticleConfig>, position?: any, velocity?: any, angularVelocity?: any): Particle | null {
    // Get from pool or create new if pool is empty
    let particle: Particle | undefined;
    let fromPool = false;

    if (this.availableParticles.length > 0) {
      const recycled: Particle[] = [];

      while (this.availableParticles.length > 0) {
        const candidate = this.availableParticles.pop() as Particle;
        const isResetPending = typeof (candidate as any).isPhysicsResetPending === 'function'
          ? (candidate as any).isPhysicsResetPending()
          : false;

        if (isResetPending) {
          recycled.push(candidate);
          continue;
        }

        particle = candidate;
        fromPool = true;
        break;
      }

      // Restore any skipped particles (maintain original order)
      while (recycled.length > 0) {
        this.availableParticles.push(recycled.pop() as Particle);
      }
    }
    
    if (!particle && this.activeParticles.size < this.poolSize * 2) {
      // Grow pool if needed
      console.log(`🆕 Creating new particle (pool exhausted at ${new Date().toISOString()}). Active: ${this.activeParticles.size}, Available: ${this.availableParticles.length}, Total created: ${this.totalCreated}`);
      particle = new Particle(this.defaultConfig, this.entityFactory);
      
      // Initialize new particle in world if available
      if (this.world) {
        (particle as any).initializeInWorld(this.world);
        // New particles need time for physics to disable
        // Mark them so we know to wait before activating
        (particle as any).needsPhysicsDelay = true;
      }
      
      this.totalCreated++;
    }
    
    if (particle) {
      // Log pool usage every 10th acquisition
      if (this.activeParticles.size % 10 === 0) {
        console.log(`♻️ Acquired particle (${fromPool ? 'from pool' : 'new'}). Active: ${this.activeParticles.size}, Available: ${this.availableParticles.length}`);
      }
      
      // Reset and configure particle
      if (config) {
        particle.reset(config);
      }
      
      // For true pooling, activate at position instead of spawning
      if (this.world && position) {
        // Check if this is a newly created particle that needs delay
        if ((particle as any).needsPhysicsDelay) {
          // Mark particle as pending activation
          (particle as any).pendingActivation = true;
          // Wait for physics to disable before activating
          setTimeout(() => {
            (particle as any).activate(this.world, position, velocity, angularVelocity);
            delete (particle as any).needsPhysicsDelay;
            delete (particle as any).pendingActivation;
          }, 20);
        } else {
          // Existing pooled particle, activate immediately
          (particle as any).activate(this.world, position, velocity, angularVelocity);
        }
      }
      // If no position, particle will be activated later by ParticleSystemV2
      
      this.activeParticles.add(particle);
      return particle;
    }
    
    return null;
  }
  
  release(particle: Particle): void {
    if (this.activeParticles.has(particle)) {
      this.activeParticles.delete(particle);
      
      // For true pooling, park instead of despawn
      if (this.world) {
        (particle as any).park();
      } else {
        particle.despawn();
      }
      
      particle.reset();
      
      // Return to pool if not over capacity
      if (this.availableParticles.length < this.poolSize * this.growthFactor) {
        setTimeout(() => {
          if (this.availableParticles.length >= this.poolSize * this.growthFactor) {
            return;
          }
          this.availableParticles.push(particle);
          // Log every 10th release
          if (this.availableParticles.length % 10 === 0) {
            console.log(`♾️ RELEASED particle back to pool. Now available: ${this.availableParticles.length}, Active: ${this.activeParticles.size}`);
          }
        }, 5);
      } else {
        console.warn(`⚠️ Pool over capacity! Not returning particle. Available: ${this.availableParticles.length}, Max: ${this.poolSize * this.growthFactor}`);
      }
    } else {
      console.warn(`⚠️ Tried to release particle not in active set!`);
    }
  }
  
  getStats() {
    return {
      available: this.availableParticles.length,
      active: this.activeParticles.size,
      totalCreated: this.totalCreated,
      poolEfficiency: this.totalCreated > 0 
        ? (this.activeParticles.size + this.availableParticles.length) / this.totalCreated 
        : 0
    };
  }
  
  clear(): void {
    // Park all active particles for true pooling
    this.activeParticles.forEach(particle => {
      if (this.world) {
        (particle as any).park();
      } else {
        particle.despawn();
      }
    });
    this.activeParticles.clear();
    
    // Don't clear available particles - keep them for reuse!
    // Only move active ones back to available
  }
}
