import { Entity, Vector3 } from './types';
import { SpatialGrid } from './SpatialGrid';

export class ParticlePool {
  private particles: Entity[] = [];
  private spatialGrid: SpatialGrid;

  constructor(cellSize: number = 10) {
    this.spatialGrid = new SpatialGrid(cellSize);
  }

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
    this.spatialGrid.removeParticle(p);
    p.despawn();
  }

  updateAll(deltaTime: number, usePhysics: boolean, gravity: boolean): void {
    for (const p of this.particles) {
      if (p.isSpawned) {
        const oldPosition = { ...p.position };
        p.update(deltaTime);
        // Update spatial grid if position changed
        if (oldPosition.x !== p.position.x || 
            oldPosition.y !== p.position.y || 
            oldPosition.z !== p.position.z) {
          this.spatialGrid.updateParticlePosition(p, oldPosition);
        }
      }
    }
  }

  getActiveParticleCount(): number {
    return this.particles.filter(p => p.isSpawned).length;
  }

  getSize(): number {
    return this.particles.length;
  }

  // New methods for spatial queries
  getNearbyParticles(position: Vector3, radius: number): Entity[] {
    return this.spatialGrid.getNearbyParticles(position, radius);
  }

  getParticlesInBounds(min: Vector3, max: Vector3): Entity[] {
    return this.spatialGrid.getParticlesInBounds(min, max);
  }

  getCellCount(): number {
    return this.spatialGrid.getCellCount();
  }
} 