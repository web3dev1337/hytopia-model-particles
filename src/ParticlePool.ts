import { Particle } from './Particle';

export class ParticlePool {
  private particles: Particle[] = [];

  getParticle(modelUri: string | undefined, size: number | undefined,
              usePhysics: boolean, gravity: boolean, maxPoolSize: number): Particle | null {
    // Try to find an unused particle first
    for (const particle of this.particles) {
      if (!particle.isInUse()) {
        return particle;
      }
    }

    // If no unused particle is found and we haven't reached the pool size limit, create a new one
    if (this.particles.length < maxPoolSize) {
      const newParticle = new Particle(modelUri, size, usePhysics, gravity);
      this.particles.push(newParticle);
      return newParticle;
    }

    // If we've reached the pool size limit, return null
    return null;
  }

  updateAll(deltaTime: number, usePhysics: boolean, gravity: boolean): void {
    for (const particle of this.particles) {
      if (particle.isInUse()) {
        particle.update(deltaTime, usePhysics, gravity);
      }
    }
  }

  getActiveParticleCount(): number {
    return this.particles.filter(p => p.isInUse()).length;
  }
} 