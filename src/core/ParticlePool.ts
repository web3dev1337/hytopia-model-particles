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
  private targetPoolSize: number = 200; // Reduced to 200 to avoid lag
  private spawnPerTick: number = 10; // Spawn 10 per tick
  private isBuilding: boolean = false;
  
  constructor(
    poolSize: number = 100,
    private defaultConfig: ParticleConfig,
    private entityFactory?: (config: any) => any,
    world?: World
  ) {
    this.poolSize = poolSize;
    this.world = world;
    // Start with empty pool - will build gradually
    if (world) {
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
  
  acquire(config?: Partial<ParticleConfig>, position?: any, velocity?: any): Particle | null {
    // Get from pool or create new if pool is empty
    let particle = this.availableParticles.pop();
    
    if (!particle && this.activeParticles.size < this.poolSize * 2) {
      // Grow pool if needed
      particle = new Particle(this.defaultConfig, this.entityFactory);
      
      // Initialize new particle in world if available
      if (this.world) {
        (particle as any).initializeInWorld(this.world);
      }
      
      this.totalCreated++;
    }
    
    if (particle) {
      // Reset and configure particle
      if (config) {
        particle.reset(config);
      }
      
      // For true pooling, activate at position instead of spawning
      if (this.world && position) {
        (particle as any).activate(this.world, position, velocity);
      }
      
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
        this.availableParticles.push(particle);
      }
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