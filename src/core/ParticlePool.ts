import { Entity, Vector3, RigidBodyOptions, CleanupStats } from '../types';
import { SpatialGrid } from '../physics/SpatialGrid';
import { ParticleLifecycleManager } from '../lifecycle/ParticleLifecycleManager';
import { ParticleDataBuffer } from '../data/ParticleDataBuffer';

export class ParticlePool {
  private particles: Entity[] = [];
  private dataBuffer: ParticleDataBuffer;
  private spatialGrid: SpatialGrid;
  private lifecycleManager: ParticleLifecycleManager;
  private cameraPosition: Vector3 = { x: 0, y: 0, z: 0 };
  private nextParticleId = 0;

  // Flags for particle state
  private static readonly FLAG_SPAWNED = 1;
  private static readonly FLAG_SLEEPING = 2;

  constructor(options: {
    cellSize?: number;
    bounds?: { min: Vector3; max: Vector3 };
    sleepDistance?: number;
    cleanupCheckInterval?: number;
    maxParticles?: number;
  } = {}) {
    const maxParticles = options.maxParticles || 1000;
    this.dataBuffer = new ParticleDataBuffer(maxParticles);
    this.spatialGrid = new SpatialGrid(options.cellSize);
    this.lifecycleManager = new ParticleLifecycleManager({
      bounds: options.bounds,
      sleepDistance: options.sleepDistance,
      cleanupCheckInterval: options.cleanupCheckInterval
    });
  }

  getParticle(model: string, size: number, rigidBody?: RigidBodyOptions, maxPoolSize: number = 1000): Entity | null {
    // Try to find an inactive particle first
    for (const particle of this.particles) {
      if (!particle.active) {
        particle.active = true;
        particle.model = model;
        particle.scale = size;
        particle.rigidBody = rigidBody;
        return particle;
      }
    }

    // No free particle found, create a new one if we haven't hit maxPoolSize
    if (this.particles.length < maxPoolSize) {
      const newParticle: Entity = {
        id: `particle-${this.nextParticleId++}`,
        active: true,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        scale: size,
        modelScale: size,
        model: model,
        rigidBody: rigidBody,
        rawRigidBody: undefined,
        isSpawned: false,
        isSleeping: false,
        spawnTime: 0,
        lastUpdateTime: performance.now(),
        sleepThreshold: 0.1, // Default sleep threshold
        cleanupDelay: 1000, // Default cleanup delay (1 second)
        spawn(world: any, pos: Vector3, vel: Vector3, lifetime: number, physics?: any) {
          this.active = true;
          this.isSpawned = true;
          this.position = { ...pos };
          this.velocity = { ...vel };
          this.spawnTime = performance.now();
          this.lastUpdateTime = this.spawnTime;
          if (physics) {
            this.rawRigidBody = physics;
          }
        },
        update(deltaTime: number) {
          const now = performance.now();
          if (!this.isSpawned || this.isSleeping) return;
          
          this.position.x += this.velocity.x * deltaTime;
          this.position.y += this.velocity.y * deltaTime;
          this.position.z += this.velocity.z * deltaTime;
          
          this.lastUpdateTime = now;
        },
        despawn() {
          this.active = false;
          this.isSpawned = false;
          this.isSleeping = false;
          this.rawRigidBody = undefined;
        },
        sleep() {
          this.isSleeping = true;
          if (this.rawRigidBody) {
            this.rawRigidBody.setSleeping(true);
          }
        },
        wake() {
          this.isSleeping = false;
          if (this.rawRigidBody) {
            this.rawRigidBody.setSleeping(false);
          }
        },
        cleanup() {
          this.despawn();
          // Additional cleanup if needed
        },
        shouldCleanup() {
          if (!this.isSpawned) return false;
          const now = performance.now();
          const age = now - this.spawnTime;
          return age > (this.cleanupDelay || 1000);
        }
      };

      this.particles.push(newParticle);
      return newParticle;
    }

    return null;
  }

  releaseParticle(p: Entity) {
    const index = (p as any).index;
    if (typeof index !== 'undefined') {
      this.spatialGrid.removeParticle(p);
      this.dataBuffer.setFlags(index, 0); // Clear all flags
      p.despawn();
    }
  }

  updateAll(deltaTime: number): void {
    // Update lifecycle manager with current state
    this.lifecycleManager.update(this.particles, this.cameraPosition, deltaTime);

    // Prepare batch updates
    const updates: Array<{
      index: number;
      position?: Vector3;
      velocity?: Vector3;
    }> = [];

    // Update active particles
    for (let i = 0; i < this.particles.length; i++) {
      const flags = this.dataBuffer.getFlags(i);
      if ((flags & ParticlePool.FLAG_SPAWNED) && !(flags & ParticlePool.FLAG_SLEEPING)) {
        const p = this.particles[i];
        const oldPosition = this.dataBuffer.getPosition(i);
        
        // Update particle
        p.update(deltaTime);
        
        // Queue update
        updates.push({
          index: i,
          position: p.position,
          velocity: p.velocity
        });
        
        // Update spatial grid if position changed
        if (oldPosition.x !== p.position.x || 
            oldPosition.y !== p.position.y || 
            oldPosition.z !== p.position.z) {
          this.spatialGrid.updateParticlePosition(p, oldPosition);
        }
      }
    }

    // Apply batch updates
    if (updates.length > 0) {
      this.dataBuffer.updateParticles(updates);
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
    return this.particles.filter(p => p.active).length;
  }

  getTotalParticleCount(): number {
    return this.particles.length;
  }

  getSleepingParticleCount(): number {
    return this.particles.filter(p => p.active && p.isSleeping).length;
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

  // New method to get position buffer for rendering
  getPositionBuffer(): Float32Array {
    return this.dataBuffer.getPositionBuffer();
  }

  // Update particle state flags
  setParticleSleeping(index: number, sleeping: boolean): void {
    let flags = this.dataBuffer.getFlags(index);
    if (sleeping) {
      flags |= ParticlePool.FLAG_SLEEPING;
    } else {
      flags &= ~ParticlePool.FLAG_SLEEPING;
    }
    this.dataBuffer.setFlags(index, flags);
  }

  // Add new methods for batch operations
  updateParticlesBatch(updates: Array<{
    particle: Entity;
    position?: Vector3;
    velocity?: Vector3;
    scale?: number;
    lifetime?: number;
    flags?: number;
  }>): void {
    const bufferUpdates = updates.map(update => ({
      index: (update.particle as any).index,
      position: update.position,
      velocity: update.velocity,
      scale: update.scale,
      lifetime: update.lifetime,
      flags: update.flags
    }));
    
    this.dataBuffer.updateParticles(bufferUpdates);
  }

  // Add method to handle resizing
  resize(newCapacity: number): void {
    this.dataBuffer.resize(newCapacity);
  }

  // Add cleanup method
  dispose(): void {
    this.dataBuffer.dispose();
    this.spatialGrid.clear();
    this.particles = [];
  }

  // Add memory usage tracking
  getMemoryStats(): {
    bufferSize: number;
    particleCount: number;
    activeCount: number;
    sleepingCount: number;
  } {
    return {
      bufferSize: this.dataBuffer.getMemoryUsage(),
      particleCount: this.particles.length,
      activeCount: this.getActiveParticleCount(),
      sleepingCount: this.getSleepingParticleCount()
    };
  }
} 