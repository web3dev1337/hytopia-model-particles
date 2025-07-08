import { Entity, World, RigidBodyType, ColliderShape, CollisionGroup } from 'hytopia';
import type { Vector3Like } from 'hytopia';
import { ParticleConfig } from './types';

export class Particle {
  private entity: Entity;
  private spawnTime: number;
  private lifetime: number;
  private isActive: boolean = false;
  private velocity?: Vector3Like;
  private angularVelocity?: Vector3Like;

  constructor(
    private config: ParticleConfig, 
    private entityFactory?: (config: any) => Entity
  ) {
    this.lifetime = config.lifetime || 5000;
    this.spawnTime = 0;
    
    const entityConfig: any = {
      name: 'Particle',
      modelUri: config.modelUri,
      modelScale: config.modelScale || 1,
      tintColor: config.tintColor
    };
    
    // Add physics if configured
    if (config.mass && config.mass > 0) {
      entityConfig.rigidBodyOptions = {
        type: RigidBodyType.DYNAMIC,
        mass: config.mass,
        friction: config.friction || 0.5,
        restitution: config.bounciness || 0.2,
        gravityScale: config.useGravity !== false ? 1 : 0,
        colliders: [
          {
            shape: ColliderShape.BALL,
            radius: 0.1,
            collisionGroups: {
              belongsTo: [config.collisionGroup || CollisionGroup.GROUP_2],
              collidesWith: [config.collisionMask || CollisionGroup.BLOCK]
            }
          }
        ]
      };
    }
    
    // Use factory if provided, otherwise create entity normally
    if (this.entityFactory) {
      this.entity = this.entityFactory(entityConfig);
    } else {
      this.entity = new Entity(entityConfig);
    }
  }

  spawn(world: World, position: Vector3Like, velocity?: Vector3Like, angularVelocity?: Vector3Like): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.spawnTime = Date.now();
    this.velocity = velocity;
    this.angularVelocity = angularVelocity;
    
    // Spawn the entity
    this.entity.spawn(world, position);
    
    // Apply velocities after spawn if physics is enabled
    if (this.config.mass && this.config.mass > 0) {
      try {
        // Apply initial velocity if provided
        if (velocity) {
          this.entity.applyImpulse(velocity);
        }
        
        // Apply angular velocity if provided
        if (angularVelocity && this.entity.rawRigidBody) {
          this.entity.rawRigidBody.setAngvel(angularVelocity, true);
        }
      } catch (physicsError) {
        // If physics fails, continue without it
        console.warn('Failed to apply physics to particle:', physicsError);
      }
    }
  }

  update(): boolean {
    if (!this.isActive) return false;
    
    const elapsed = Date.now() - this.spawnTime;
    if (elapsed >= this.lifetime) {
      this.despawn();
      return false;
    }
    
    return true;
  }

  despawn(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.entity.despawn();
  }

  reset(config?: Partial<ParticleConfig>): void {
    if (config) {
      Object.assign(this.config, config);
      
      // If model or physics changed, we need to recreate the entity
      if ((config.modelUri && config.modelUri !== this.entity.modelUri) || 
          config.mass !== undefined || config.friction !== undefined || 
          config.bounciness !== undefined || config.useGravity !== undefined) {
        // Only despawn if the entity is actually spawned
        if (this.entity.isSpawned) {
          this.entity.despawn();
        }
        
        const entityConfig: any = {
          name: 'Particle',
          modelUri: this.config.modelUri,
          modelScale: this.config.modelScale || 1,
          tintColor: this.config.tintColor
        };
        
        // Add physics if configured
        if (this.config.mass && this.config.mass > 0) {
          entityConfig.rigidBodyOptions = {
            type: RigidBodyType.DYNAMIC,
            mass: this.config.mass,
            friction: this.config.friction || 0.5,
            restitution: this.config.bounciness || 0.2,
            gravityScale: this.config.useGravity !== false ? 1 : 0,
            colliders: [
              {
                shape: ColliderShape.BALL,
                radius: 0.1,
                collisionGroups: {
                  belongsTo: [this.config.collisionGroup || CollisionGroup.GROUP_2],
                  collidesWith: [this.config.collisionMask || CollisionGroup.BLOCK]
                }
              }
            ]
          };
        }
        
        if (this.entityFactory) {
          this.entity = this.entityFactory(entityConfig);
        } else {
          this.entity = new Entity(entityConfig);
        }
      }
    }
    this.isActive = false;
  }

  get active(): boolean {
    return this.isActive;
  }
  
  get position(): Vector3Like | undefined {
    return this.entity.position;
  }
}