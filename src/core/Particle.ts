import { Entity, World, RigidBodyType, ColliderShape, CollisionGroup } from 'hytopia';
import type { Vector3Like } from 'hytopia';
import { ParticleConfig, ParticleAnimations, ColorLike, ColorGradient } from '../types';
import { AnimationSystem } from '../animation/AnimationSystem';

export class Particle {
  private entity: Entity;
  private spawnTime: number;
  private lifetime: number;
  private isActive: boolean = false;
  private velocity?: Vector3Like;
  private angularVelocity?: Vector3Like;
  
  // Pooling support
  public bufferIndex: number = -1;
  
  // True pooling support
  private isInitialized: boolean = false;
  private parkingPosition: Vector3Like = { x: 0, y: -1000, z: 0 };
  private targetPosition?: Vector3Like;
  private rigidBody?: any; // Reference to entity's rigid body
  
  // Animation properties
  private animations?: ParticleAnimations;
  private baseScale: number;
  private baseColor: ColorLike;
  private currentRotation: number = 0;
  private rotationVelocity: number = 0;
  private isColorGradient: boolean = false;
  private colorGradient?: ColorGradient;
  
  // Animation state
  private currentScale: number;
  private currentColor: ColorLike;
  private currentOpacity: number = 1;

  constructor(
    private config: ParticleConfig, 
    private entityFactory?: (config: any) => Entity
  ) {
    this.lifetime = config.lifetime || 5000;
    console.log('🕐 Particle lifetime set to:', this.lifetime, 'from config:', config.lifetime);
    this.spawnTime = 0;
    
    // Parse scale config
    if (typeof config.modelScale === 'object') {
      this.baseScale = config.modelScale.start;
      this.currentScale = this.baseScale;
      // Create scale animation if not already defined
      if (!config.animations) {
        config.animations = {};
      }
      if (!config.animations.scaleOverTime) {
        config.animations.scaleOverTime = {
          start: config.modelScale.start,
          end: config.modelScale.end
        };
      }
    } else {
      this.baseScale = config.modelScale || 1;
      this.currentScale = this.baseScale;
    }
    
    // Parse color config
    if (config.tintColor && 'keyframes' in config.tintColor) {
      this.isColorGradient = true;
      this.colorGradient = config.tintColor as ColorGradient;
      this.baseColor = this.colorGradient.keyframes[0].color;
      this.currentColor = { ...this.baseColor };
    } else {
      this.baseColor = (config.tintColor as ColorLike) || { r: 255, g: 255, b: 255 };
      this.currentColor = { ...this.baseColor };
    }
    
    // Parse opacity config
    if (typeof config.opacity === 'object') {
      this.currentOpacity = config.opacity.start;
      if (!config.animations) {
        config.animations = {};
      }
      if (!config.animations.opacityOverTime) {
        config.animations.opacityOverTime = {
          start: config.opacity.start,
          end: config.opacity.end
        };
      }
    } else {
      this.currentOpacity = config.opacity || 1;
    }
    
    // Store animations
    this.animations = config.animations;
    
    // Parse rotation config
    if (config.rotation) {
      this.currentRotation = config.rotation.min + 
        Math.random() * (config.rotation.max - config.rotation.min);
      this.rotationVelocity = config.rotation.velocity || 0;
    }
    
    // Create entity
    const entityConfig: any = {
      name: 'Particle',
      modelUri: config.modelUri,
      modelScale: this.currentScale,
      tintColor: this.currentColor,
      opacity: this.currentOpacity
    };
    
    // Add physics if configured (matching current codebase pattern)
    if (config.mass && config.mass > 0) {
      entityConfig.rigidBodyOptions = {
        type: RigidBodyType.DYNAMIC,
        colliders: [
          {
            shape: ColliderShape.BALL,
            radius: 0.1 * this.currentScale,
            mass: config.mass,
            friction: config.friction || 0.5,
            bounciness: config.bounciness || 0.2,
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

  /**
   * Initialize the entity once in the world (for pooling)
   */
  initializeInWorld(world: World): void {
    if (this.isInitialized) return;
    
    // Spawn entity at parking position
    this.entity.spawn(world, this.parkingPosition);
    this.isInitialized = true;
    
    // Hide immediately
    this.entity.setOpacity(0.0);
    
    // Try to get rigid body reference after spawn
    setTimeout(() => {
      if ((this.entity as any).rawRigidBody) {
        this.rigidBody = (this.entity as any).rawRigidBody;
      }
    }, 50);
    
    console.log('🏊 Particle spawned at parking position for pooling');
  }
  
  /**
   * Activate particle at position (for pooling)
   */
  activate(world: World, position: Vector3Like, velocity?: Vector3Like, angularVelocity?: Vector3Like): void {
    if (this.isActive) return;
    
    // Initialize if not already done
    if (!this.isInitialized) {
      this.initializeInWorld(world);
      // Wait a bit for spawn to complete
      setTimeout(() => this.activate(world, position, velocity, angularVelocity), 100);
      return;
    }
    
    this.isActive = true;
    this.spawnTime = Date.now();
    this.velocity = velocity;
    this.angularVelocity = angularVelocity;
    this.targetPosition = position;
    
    // Reset animation state
    this.currentScale = this.baseScale;
    this.currentColor = { ...this.baseColor };
    this.currentOpacity = this.animations?.opacityOverTime?.start || 1;
    
    // Use setPosition to move entity - THIS IS THE KEY!
    if (this.entity.isSpawned && typeof (this.entity as any).setPosition === 'function') {
      // Reset physics state first
      if (typeof (this.entity as any).setLinearVelocity === 'function') {
        (this.entity as any).setLinearVelocity({ x: 0, y: 0, z: 0 });
      }
      if (typeof (this.entity as any).setAngularVelocity === 'function') {
        (this.entity as any).setAngularVelocity({ x: 0, y: 0, z: 0 });
      }
      
      // Move to position
      (this.entity as any).setPosition(position);
      
      // Make visible
      this.entity.setOpacity(this.currentOpacity);
      
      // Apply new physics
      if (velocity) {
        this.applyPhysics(velocity, angularVelocity);
      }
    } else {
      // Fallback if not spawned or no setPosition
      if (this.entity.isSpawned) {
        this.entity.despawn();
      }
      this.entity.spawn(world, position);
      
      if (velocity) {
        this.applyPhysics(velocity, angularVelocity);
      }
    }
  }
  
  /**
   * Old spawn method for backward compatibility
   */
  spawn(world: World, position: Vector3Like, velocity?: Vector3Like, angularVelocity?: Vector3Like): void {
    this.activate(world, position, velocity, angularVelocity);
  }
  
  /**
   * Move entity to position using available methods
   */
  private moveToPosition(position: Vector3Like, velocity?: Vector3Like): void {
    // Try different methods to move the entity
    
    // Method 1: Use rigid body if available
    if (this.rigidBody) {
      try {
        // For kinematic bodies
        if (this.rigidBody.isKinematicPositionBased && this.rigidBody.isKinematicPositionBased()) {
          this.rigidBody.setNextKinematicPosition(position);
        } else {
          // For dynamic bodies, temporarily make kinematic
          const wasEnabled = this.rigidBody.isEnabled();
          this.rigidBody.setPosition(position);
          if (velocity) {
            this.rigidBody.setLinearVelocity(velocity);
          }
        }
        return;
      } catch (e) {
        console.warn('Failed to move particle via rigid body:', e);
      }
    }
    
    // Method 2: If entity has controller with move method
    if ((this.entity as any).controller && typeof (this.entity as any).controller.move === 'function') {
      try {
        (this.entity as any).controller.move(position, 1000, { instant: true });
        return;
      } catch (e) {
        console.warn('Failed to move particle via controller:', e);
      }
    }
    
    // Method 3: Fallback - despawn and respawn (old method)
    // Only use this fallback if we're not in pooling mode
    if (!this.isInitialized) {
      console.warn('⚠️ No movement method available, falling back to respawn');
      if (this.entity.isSpawned) {
        this.entity.despawn();
      }
      const world = (this.entity as any).world;
      if (world) {
        this.entity.spawn(world, position);
      }
    } else {
      // In pooling mode but can't move - this is a problem
      console.error('❌ Cannot move pooled particle - entity movement not supported!');
    }
    
    // Apply velocities if physics is enabled
    if (this.config.mass && this.config.mass > 0 && velocity) {
      this.applyPhysics(velocity, this.angularVelocity);
    }
  }

  update(): boolean {
    if (!this.isActive) return false;
    
    const elapsed = Date.now() - this.spawnTime;
    if (elapsed >= this.lifetime) {
      this.despawn();
      return false;
    }
    
    // Calculate lifetime progress (0 to 1)
    const progress = elapsed / this.lifetime;
    
    // Apply animations
    if (this.animations || this.isColorGradient) {
      this.applyAnimations(progress, elapsed);
    }
    
    // Apply rotation
    if (this.rotationVelocity !== 0 || (this.animations?.rotationOverTime)) {
      this.applyRotation(elapsed);
    }
    
    return true;
  }

  private applyAnimations(progress: number, elapsed: number): void {
    let needsUpdate = false;
    
    // Scale animation
    if (this.animations?.scaleOverTime) {
      const { start, end, curve } = this.animations.scaleOverTime;
      this.currentScale = AnimationSystem.interpolateValue(start, end, progress, curve);
      // Scale changes not supported on spawned entities
      needsUpdate = true;
    }
    
    // Color animation
    if (this.animations?.colorOverTime) {
      this.currentColor = AnimationSystem.interpolateColor(
        this.animations.colorOverTime, 
        progress
      );
      // Color changes not supported on spawned entities
      needsUpdate = true;
    } else if (this.isColorGradient && this.colorGradient) {
      this.currentColor = AnimationSystem.interpolateColor(
        this.colorGradient,
        progress
      );
      // Color changes not supported on spawned entities
      needsUpdate = true;
    }
    
    // Opacity animation
    if (this.animations?.opacityOverTime) {
      const { start, end, curve } = this.animations.opacityOverTime;
      this.currentOpacity = AnimationSystem.interpolateValue(start, end, progress, curve);
      if (this.entity.opacity !== undefined) {
        // Opacity changes not supported on spawned entities
        needsUpdate = true;
      }
    }
  }

  private applyRotation(elapsed: number): void {
    const deltaSeconds = elapsed / 1000;
    
    if (this.animations?.rotationOverTime) {
      const { velocity, acceleration } = this.animations.rotationOverTime;
      let currentVelocity = velocity;
      
      if (acceleration) {
        currentVelocity += acceleration * deltaSeconds;
      }
      
      this.currentRotation += currentVelocity * deltaSeconds;
    } else if (this.rotationVelocity !== 0) {
      this.currentRotation += this.rotationVelocity * deltaSeconds;
    }
    
    // Rotation changes not supported on spawned entities
  }

  /**
   * Park the particle (for pooling) - moves to parking spot
   */
  park(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.entity.isSpawned && typeof (this.entity as any).setPosition === 'function') {
      // Reset velocities
      if (typeof (this.entity as any).setLinearVelocity === 'function') {
        (this.entity as any).setLinearVelocity({ x: 0, y: 0, z: 0 });
      }
      if (typeof (this.entity as any).setAngularVelocity === 'function') {
        (this.entity as any).setAngularVelocity({ x: 0, y: 0, z: 0 });
      }
      
      // Move to parking position
      (this.entity as any).setPosition(this.parkingPosition);
      
      // Hide
      this.entity.setOpacity(0.0);
    }
  }
  
  /**
   * Old despawn method - now parks instead for pooling
   */
  despawn(): void {
    // If entity is spawned, park it; otherwise actually despawn
    if (this.entity.isSpawned && this.isInitialized) {
      this.park();
    } else if (this.entity.isSpawned) {
      // Fallback to actual despawn if not initialized for pooling
      this.isActive = false;
      this.entity.despawn();
    } else {
      // Entity not spawned, just mark inactive
      this.isActive = false;
    }
  }
  
  /**
   * Apply physics velocities
   */
  private applyPhysics(velocity?: Vector3Like, angularVel?: Vector3Like): void {
    if (!velocity) return;
    
    const maxRetries = 5;
    let retries = 0;
    const retryDelay = 50;
    
    const tryApplyPhysics = () => {
      try {
        const rb = this.rigidBody || (this.entity as any).rawRigidBody;
        if (rb) {
          rb.applyImpulse(velocity);
          if (angularVel) {
            rb.applyTorqueImpulse(angularVel);
          } else {
            // Add tiny random spin
            const randomSpin = {
              x: (Math.random() - 0.5) * 0.02,
              y: (Math.random() - 0.5) * 0.02,
              z: (Math.random() - 0.5) * 0.02
            };
            rb.applyTorqueImpulse(randomSpin);
          }
        } else if (retries < maxRetries) {
          retries++;
          setTimeout(tryApplyPhysics, retryDelay);
        }
      } catch (e) {
        if (retries < maxRetries) {
          retries++;
          setTimeout(tryApplyPhysics, retryDelay);
        }
      }
    };
    
    setTimeout(tryApplyPhysics, 100);
  }

  reset(config?: Partial<ParticleConfig>): void {
    if (config) {
      Object.assign(this.config, config);
      
      // If significant changes, recreate entity
      if ((config.modelUri && config.modelUri !== this.entity.modelUri) || 
          config.mass !== undefined || config.friction !== undefined || 
          config.bounciness !== undefined || config.useGravity !== undefined) {
        
        // Only despawn if spawned
        if (this.entity.isSpawned) {
          this.entity.despawn();
        }
        
        // Recreate entity with new config
        // ... (entity creation code same as constructor)
      }
    }
    this.isActive = false;
  }

  get active(): boolean {
    return this.isActive;
  }
  
  get position(): Vector3Like | undefined {
    // Cache position to avoid Rust aliasing errors
    if (!this.entity.position) return undefined;
    const pos = this.entity.position;
    return { x: pos.x, y: pos.y, z: pos.z };
  }
  
  getLifetimeProgress(): number {
    if (!this.isActive) return 0;
    const elapsed = Date.now() - this.spawnTime;
    return Math.min(elapsed / this.lifetime, 1);
  }
}