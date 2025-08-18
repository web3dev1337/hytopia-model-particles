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
  
  constructor(
    poolSize: number = 100,
    private defaultConfig: ParticleConfig,
    private entityFactory?: (config: any) => any,
    world?: World
  ) {
    this.poolSize = poolSize;
    this.world = world;
    // Don't pre-spawn entities - create them on demand
    // Pre-spawning too many entities kills performance
    this.initializePool();
  }
  
  /**
   * Initialize pool with world reference for true entity pooling
   */
  public initializeWithWorld(world: World): void {
    this.world = world;
    if (this.availableParticles.length === 0) {
      this.initializePool();
    } else {
      // Initialize any existing particles that aren't spawned yet
      this.availableParticles.forEach(particle => {
        (particle as any).initializeInWorld(world);
      });
    }
  }
  
  private initializePool(): void {
    // Create particle wrappers but don't spawn entities yet
    // We'll spawn on demand to avoid performance issues
    for (let i = 0; i < Math.min(20, this.poolSize); i++) {
      const particle = new Particle(this.defaultConfig, this.entityFactory);
      this.availableParticles.push(particle);
      this.totalCreated++;
    }
    
    console.log(`🏊 Initialized particle pool with ${Math.min(20, this.poolSize)} particle wrappers (entities spawn on demand)`);
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