import { Entity } from './types';

export class ParticlePool {
  private particles: Entity[] = [];

  getParticle(modelUri: string | undefined, size: number | undefined,
              usePhysics: boolean, gravity: boolean, maxPoolSize: number): Entity | null {
    // Find an unused particle in the pool
    for (const p of this.particles) {
      if (!p.isSpawned) {
        return p;
      }
    }
    // No free particle found, create a new one if we haven't hit maxPoolSize
    if (this.particles.length < maxPoolSize) {
      // @ts-ignore - Using placeholder Entity creation for now
      const newParticle = new Entity({
        modelUri,
        modelScale: size,
        rigidBodyOptions: usePhysics ? {
          type: 'dynamic',
          useGravity: gravity
        } : undefined
      });
      this.particles.push(newParticle);
      return newParticle;
    }
    // Pool is at max capacity and all particles are in use
    return null;
  }

  releaseParticle(p: Entity) {
    p.despawn();
    // (Despawning already marks it free; this method can be expanded if needed.)
  }

  updateAll(deltaTime: number, usePhysics: boolean, gravity: boolean): void {
    for (const p of this.particles) {
      if (p.isSpawned) {
        p.update(deltaTime);
      }
    }
  }

  getActiveParticleCount(): number {
    return this.particles.filter(p => p.isSpawned).length;
  }

  getSize(): number {
    return this.particles.length;
  }
} 