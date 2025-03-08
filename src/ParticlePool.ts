import { Entity, Vector3, RigidBodyOptions, CleanupStats } from './types';
import { SpatialGrid } from './SpatialGrid';
import { ParticleLifecycleManager } from './ParticleLifecycleManager';

export class ParticlePool {
  private particles: Entity[] = [];
  private spatialGrid: SpatialGrid;
  private lifecycleManager: ParticleLifecycleManager;
  private cameraPosition: Vector3 = { x: 0, y: 0, z: 0 };

  constructor(options: {
    cellSize?: number;
    bounds?: { min: Vector3; max: Vector3 };
    sleepDistance?: number;
    cleanupCheckInterval?: number;
  } = {}) {
    this.spatialGrid = new SpatialGrid(options.cellSize);
    this.lifecycleManager = new ParticleLifecycleManager({
      bounds: options.bounds,
      sleepDistance: options.sleepDistance,
      cleanupCheckInterval: options.cleanupCheckInterval
    });
  }

  getParticle(modelUri: string | undefined, size: number | undefined,
              rigidBodyOptions: RigidBodyOptions | undefined, maxPoolSize: number): Entity | null {
    // Clean up any particles that should be removed
    this.cleanupInactiveParticles();

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
        rigidBodyOptions
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
    // Actual cleanup will be handled by lifecycle manager
  }

  updateAll(deltaTime: number): void {
    // Update lifecycle manager with current state
    this.lifecycleManager.update(this.particles, this.cameraPosition, deltaTime);

    // Update active particles
    for (const p of this.particles) {
      if (p.isSpawned && !p.isSleeping) {
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

  private cleanupInactiveParticles(): void {
    this.particles = this.particles.filter(p => {
      if (!p.isSpawned && this.lifecycleManager.shouldCleanup(p, performance.now())) {
        this.lifecycleManager.cleanupParticle(p, 'manual');
        return false;
      }
      return true;
    });
  }

  setWorldBounds(min: Vector3, max: Vector3): void {
    this.lifecycleManager.setBounds({ min, max });
  }

  setCameraPosition(position: Vector3): void {
    this.cameraPosition = position;
  }

  setSleepDistance(distance: number): void {
    this.lifecycleManager.setSleepDistance(distance);
  }

  getActiveParticleCount(): number {
    return this.particles.filter(p => p.isSpawned && !p.isSleeping).length;
  }

  getTotalParticleCount(): number {
    return this.particles.length;
  }

  getSleepingParticleCount(): number {
    return this.particles.filter(p => p.isSpawned && p.isSleeping).length;
  }

  getCleanupStats(): CleanupStats {
    return this.lifecycleManager.getCleanupStats();
  }

  // Spatial query methods
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