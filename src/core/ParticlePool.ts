import { Particle } from './Particle';
import { ParticleConfig } from '../types';

/**
 * Object pool for particle reuse to minimize garbage collection
 * High-performance pooling system that pre-creates particles
 */
export class ParticlePool {
  private availableParticles: Particle[] = [];
  private activeParticles: Set<Particle> = new Set();
  private readonly poolSize: number;
  private readonly growthFactor: number = 1.5;
  private totalCreated: number = 0;
  
  constructor(
    poolSize: number = 100,
    private defaultConfig: ParticleConfig,
    private entityFactory?: (config: any) => any
  ) {
    this.poolSize = poolSize;
    this.initializePool();
  }
  
  private initializePool(): void {
    // Pre-create particles for the pool
    for (let i = 0; i < this.poolSize; i++) {
      const particle = new Particle(this.defaultConfig, this.entityFactory);
      this.availableParticles.push(particle);
      this.totalCreated++;
    }
  }
  
  acquire(config?: Partial<ParticleConfig>): Particle | null {
    // Get from pool or create new if pool is empty
    let particle = this.availableParticles.pop();
    
    if (!particle && this.activeParticles.size < this.poolSize * 2) {
      // Grow pool if needed
      particle = new Particle(this.defaultConfig, this.entityFactory);
      this.totalCreated++;
    }
    
    if (particle) {
      // Reset and configure particle
      if (config) {
        particle.reset(config);
      }
      this.activeParticles.add(particle);
      return particle;
    }
    
    return null;
  }
  
  release(particle: Particle): void {
    if (this.activeParticles.has(particle)) {
      this.activeParticles.delete(particle);
      particle.despawn();
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
    // Despawn all active particles
    this.activeParticles.forEach(particle => {
      particle.despawn();
    });
    this.activeParticles.clear();
    this.availableParticles = [];
  }
}