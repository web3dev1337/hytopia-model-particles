import { Entity, Vector3, World } from '../types';

export class Particle {
  private entity: Entity;
  private inUse: boolean = false;
  private life: number = 0;
  private velocity: Vector3 = { x: 0, y: 0, z: 0 };
  private position: Vector3 = { x: 0, y: 0, z: 0 };
  private originalScale: number = 1;

  constructor(world: World, modelUri?: string, size?: number) {
    // Use HYTOPIA SDK to create entity
    this.originalScale = size || 1;
    this.entity = world.createEntity({
      model: modelUri || 'models/projectiles/fireball.gltf', // Default model if none provided
      scale: this.originalScale,
      name: 'particle-' + Math.floor(Math.random() * 10000)
    });
  }

  spawn(world: World, position: Vector3, velocity: Vector3, lifetime: number, usePhysics: boolean, gravity: boolean): void {
    this.inUse = true;
    this.life = lifetime;
    this.velocity = { ...velocity };
    this.position = { ...position };
    
    // Actually spawn the entity in the world
    try {
      // Store position for updates
      this.entity.position = { ...position };
      
      // Spawn the entity in the world
      this.entity.spawn(world, position, velocity, lifetime, usePhysics);
      
      console.log(`Particle spawned at position: ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`);
    } catch (e) {
      console.error("Error spawning particle entity:", e);
    }
  }

  update(deltaTime: number, usePhysics: boolean, gravity: boolean): void {
    if (!this.inUse) return;

    this.life -= deltaTime;
    if (this.life <= 0) {
      this.despawn();
      return;
    }

    // Apply gravity to velocity if enabled
    if (gravity && !usePhysics) {
      this.velocity.y -= 9.81 * deltaTime;
    }

    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;

    // Update entity position
    try {
      // Just update the position property directly
      this.entity.position = { ...this.position };
    } catch (e) {
      console.error("Error updating particle position:", e);
    }

    // Optional: Fade out particles over lifetime by scaling them down
    const remainingLifePercent = this.life / this.life;
    if (remainingLifePercent < 0.5) {
      const scale = this.originalScale * (0.5 + remainingLifePercent);
      try {
        // Update scale directly
        this.entity.scale = scale;
        this.entity.modelScale = scale;
      } catch (e) {
        // Silently ignore scaling errors
      }
    }
  }

  despawn(): void {
    if (!this.inUse) return;
    
    try {
      // Despawn the entity from the world
      if (this.entity && this.entity.isSpawned) {
        this.entity.despawn();
      }
    } catch (e) {
      console.error("Error despawning particle entity:", e);
    }
    
    // Reset particle state
    this.inUse = false;
    this.velocity = { x: 0, y: 0, z: 0 };
    this.position = { x: 0, y: 0, z: 0 };
  }

  isInUse(): boolean {
    return this.inUse;
  }
  
  getEntity(): Entity {
    return this.entity;
  }
  
  getPosition(): Vector3 {
    return this.position;
  }
}