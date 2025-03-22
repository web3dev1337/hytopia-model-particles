import { Vector3, World } from '../types';

// Simplify the particle implementation to focus on the core functionality
export class Particle {
  private entity: any; // Use any type to avoid TypeScript issues
  private inUse: boolean = false;
  private life: number = 0;
  private initialLife: number = 0;
  private velocity: Vector3 = { x: 0, y: 0, z: 0 };
  private position: Vector3 = { x: 0, y: 0, z: 0 };
  private originalScale: number = 1;
  private particleId: string;

  constructor(world: World, modelUri?: string, size?: number) {
    this.originalScale = size || 1;
    this.particleId = 'particle-' + Math.floor(Math.random() * 10000);
    
    try {
      // Create entity with Hytopia SDK
      this.entity = world.createEntity({
        model: modelUri || 'models/projectiles/fireball.gltf',
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
    
    try {
      // Spawn entity with Hytopia SDK - just use position
      this.entity.spawn(world, position);
      
      console.log(`Particle ${this.particleId} spawned at position: ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`);
      
      // Update position after a short delay to ensure visibility
      setTimeout(() => {
        try {
          if (this.entity && this.entity.isSpawned && this.inUse) {
            this.entity.position = { ...this.position };
          }
        } catch (err) {
          // Ignore errors
        }
      }, 50);
    } catch (e) {
      console.error(`Error spawning particle: ${e}`);
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
      // Update position based on velocity
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
      this.position.z += this.velocity.z * deltaTime;

      // Update entity position
      this.entity.position = { ...this.position };

      // Scale based on remaining life
      const remainingLifePercent = this.life / this.initialLife;
      let scale = this.originalScale;
      
      if (remainingLifePercent < 0.8) {
        scale = this.originalScale * (0.2 + remainingLifePercent);
      }
      
      // Update scale
      this.entity.modelScale = scale;
      
      // Log occasional updates
      if (Math.random() < 0.01) {
        console.log(`Particle update: pos=(${this.position.x.toFixed(1)},${this.position.y.toFixed(1)},${this.position.z.toFixed(1)}), life=${(remainingLifePercent*100).toFixed(0)}%`);
      }
    } catch (e) {
      console.error(`Error updating particle: ${e}`);
    }
  }

  despawn(): void {
    if (!this.inUse) return;
    
    try {
      // Despawn entity with Hytopia SDK
      if (this.entity && this.entity.isSpawned) {
        this.entity.despawn();
      }
    } catch (e) {
      console.error(`Error despawning particle: ${e}`);
    }
    
    // Reset state
    this.inUse = false;
    this.velocity = { x: 0, y: 0, z: 0 };
    this.position = { x: 0, y: 0, z: 0 };
    this.initialLife = 0;
  }

  isInUse(): boolean {
    return this.inUse;
  }
  
  getEntity(): any {
    return this.entity;
  }
  
  getPosition(): Vector3 {
    return this.position;
  }
}