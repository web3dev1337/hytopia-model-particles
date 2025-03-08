import { Entity, Vector3, World } from './types';

export class Particle {
  private entity: Entity;
  private inUse: boolean = false;
  private life: number = 0;
  private velocity: Vector3 = { x: 0, y: 0, z: 0 };

  constructor(modelUri?: string, size?: number, usePhysics: boolean = false, gravity: boolean = true) {
    // Note: This constructor will need to be updated once we have access to the actual Hytopia SDK
    this.entity = {} as Entity;
  }

  spawn(world: World, position: Vector3, velocity: Vector3, lifetime: number, usePhysics: boolean, gravity: boolean): void {
    this.inUse = true;
    this.life = lifetime;
    this.velocity = { ...velocity };
    // Note: This method will need to be updated with actual entity spawning logic once we have access to the SDK
  }

  update(deltaTime: number, usePhysics: boolean, gravity: boolean): void {
    if (!this.inUse) return;

    this.life -= deltaTime;
    if (this.life <= 0) {
      this.despawn();
      return;
    }

    if (!usePhysics) {
      // Simple velocity-based movement for non-physics particles
      // Note: This will need to be updated with actual entity position manipulation once we have the SDK
      this.velocity.y -= gravity ? 9.81 * deltaTime : 0;
    }
  }

  despawn(): void {
    if (!this.inUse) return;
    this.inUse = false;
    this.velocity = { x: 0, y: 0, z: 0 };
    // Note: This method will need to be updated with actual entity despawning logic once we have the SDK
  }

  isInUse(): boolean {
    return this.inUse;
  }
} 