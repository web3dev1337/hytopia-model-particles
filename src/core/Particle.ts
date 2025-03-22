import { Entity, Vector3, World } from '../types';

export class Particle {
  private entity: Entity;
  private inUse: boolean = false;
  private life: number = 0;
  private initialLife: number = 0;
  private velocity: Vector3 = { x: 0, y: 0, z: 0 };
  private position: Vector3 = { x: 0, y: 0, z: 0 };
  private originalScale: number = 1;
  private particleId: string;

  constructor(world: World, modelUri?: string, size?: number) {
    // Use HYTOPIA SDK to create entity
    this.originalScale = size || 1;
    this.particleId = 'particle-' + Math.floor(Math.random() * 10000);
    
    try {
      this.entity = world.createEntity({
        model: modelUri || 'models/projectiles/fireball.gltf', // Default model if none provided
        modelScale: this.originalScale,
        name: this.particleId
      });
      
      console.log(`Created particle entity with model: ${modelUri || 'models/projectiles/fireball.gltf'}, scale: ${this.originalScale}`);
    } catch (error) {
      console.error(`Error creating particle entity: ${error}`);
      throw error;
    }
  }

  spawn(world: World, position: Vector3, velocity: Vector3, lifetime: number, usePhysics: boolean): void {
    this.inUse = true;
    this.life = lifetime;
    this.initialLife = lifetime;
    this.velocity = { ...velocity };
    this.position = { ...position };
    
    // Actually spawn the entity in the world
    try {
      // Spawn the entity in the world - this is the correct Hytopia Entity API
      this.entity.spawn(world, position);
      
      // After spawning, set velocity
      if (this.entity.rigidBody && usePhysics) {
        // Apply velocity to rigid body if using physics
        this.entity.rigidBody.setLinearVelocity(velocity);
      }
      
      console.log(`Particle ${this.particleId} spawned at position: ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`);
      
      // Double-check the entity is at the correct position after spawn
      setTimeout(() => {
        try {
          if (this.entity && this.entity.isSpawned && this.inUse) {
            // Update position again after a short delay to ensure visibility
            this.entity.position = { ...this.position };
            console.log(`Particle ${this.particleId} position verified: ${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}, ${this.position.z.toFixed(2)}`);
          }
        } catch (err) {
          // Ignore errors in the delayed check
        }
      }, 50);
    } catch (e) {
      console.error(`Error spawning particle entity ${this.particleId}:`, e);
    }
  }

  update(deltaTime: number, usePhysics: boolean, gravity: boolean): void {
    if (!this.inUse || !this.entity || !this.entity.isSpawned) return;

    this.life -= deltaTime;
    if (this.life <= 0) {
      this.despawn();
      return;
    }

    try {
      // Update physics using the SDK's recommended approach
      if (usePhysics && this.entity.rigidBody) {
        // Physics is handled by the SDK
        
        // Read back position from physics simulation
        this.position = { ...this.entity.position };
      } else {
        // Manual updates for non-physics particles
        
        // Apply gravity to velocity if enabled and not using physics
        if (gravity) {
          this.velocity.y -= 9.81 * deltaTime;
        }

        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // Set the entity position - standard SDK approach
        this.entity.position = { ...this.position };
      }

      // Properly calculate remaining life percentage for scaling/fading
      const remainingLifePercent = this.life / this.initialLife;
      
      // Scale down particles over lifetime
      let scale = this.originalScale;
      
      // Apply scaling based on lifetime
      if (remainingLifePercent < 0.8) {
        scale = this.originalScale * (0.2 + remainingLifePercent);
      }
      
      // Apply scale using SDK method
      this.entity.modelScale = scale;
      
      // Log occasional updates for debugging
      if (Math.random() < 0.01) { // Log ~1% of updates
        console.log(`Particle ${this.particleId} update: pos=(${this.position.x.toFixed(1)},${this.position.y.toFixed(1)},${this.position.z.toFixed(1)}), life=${(remainingLifePercent*100).toFixed(0)}%, scale=${scale.toFixed(2)}`);
      }
    } catch (e) {
      console.error(`Error updating particle ${this.particleId}:`, e);
    }
  }

  despawn(): void {
    if (!this.inUse) return;
    
    try {
      // Log despawn for tracking
      console.log(`Particle ${this.particleId} despawning: pos=(${this.position.x.toFixed(1)},${this.position.y.toFixed(1)},${this.position.z.toFixed(1)})`);
      
      // Despawn the entity from the world using the SDK method
      if (this.entity && this.entity.isSpawned) {
        this.entity.despawn();
      }
    } catch (e) {
      console.error(`Error despawning particle entity ${this.particleId}:`, e);
    }
    
    // Reset particle state
    this.inUse = false;
    this.velocity = { x: 0, y: 0, z: 0 };
    this.position = { x: 0, y: 0, z: 0 };
    this.initialLife = 0;
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