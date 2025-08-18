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
  private parkingPosition: Vector3Like = { x: 0, y: -50, z: 0 }; // Park underground but not too deep
  private rigidBody?: any; // Reference to entity's rigid body
  private _cachedPosition?: Vector3Like; // Cache position to avoid Rust aliasing
  
  // Debug tracking
  private static debugParticleId: number = 0;
  private particleId: number;
  
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
    // console.log('🕐 Particle lifetime set to:', this.lifetime, 'from config:', config.lifetime);
    this.spawnTime = 0;
    
    // Assign unique ID for tracking
    this.particleId = Particle.debugParticleId++;
    
    // Start debug tracking for first particle
    if (this.particleId === 0) {
      this.startDebugTracking();
    }
    
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
        ccdEnabled: false,  // DISABLE CCD to prevent tunneling issues with teleportation
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
    
    // IMMEDIATELY disable physics to reduce overhead
    setTimeout(() => {
      const rb = (this.entity as any).rawRigidBody;
      if (rb && typeof rb.setEnabled === 'function') {
        rb.setEnabled(false); // Disable physics when parked
        this.rigidBody = rb;
        
        // Try to disable CCD if possible
        if (typeof rb.setCcdEnabled === 'function') {
          rb.setCcdEnabled(false);
        }
        if (typeof rb.enableCcd === 'function') {
          rb.enableCcd(false);
        }
      }
    }, 50);
    
    // Hide immediately
    this.entity.setOpacity(0.0);
  }
  
  /**
   * Activate particle at position (true pooling with physics disable)
   */
  activate(world: World, position: Vector3Like, velocity?: Vector3Like, angularVelocity?: Vector3Like): void {
    if (this.isActive) return;
    
    // Initialize if not already done
    if (!this.isInitialized) {
      this.initializeInWorld(world);
      // Wait for initialization
      setTimeout(() => this.activate(world, position, velocity, angularVelocity), 100);
      return;
    }
    
    this.isActive = true;
    this.spawnTime = Date.now();
    this.velocity = velocity;
    this.angularVelocity = angularVelocity;
    
    // Debug log for first particle
    if (this.particleId === 0) {
      console.log(`🚀 P#0 ACTIVATING at position:`, position, `with velocity:`, velocity);
    }
    
    // Reset animation state
    this.currentScale = this.baseScale;
    this.currentColor = { ...this.baseColor };
    this.currentOpacity = this.animations?.opacityOverTime?.start || 1;
    
    // Update cached position
    this._cachedPosition = { ...position };
    
    // TRUE POOLING: Move entity and enable physics
    if (this.entity.isSpawned) {
      const rb = this.rigidBody || (this.entity as any).rawRigidBody;
      if (rb) {
        // FIRST: Move to position BEFORE enabling physics to avoid tunneling
        if (typeof (this.entity as any).setPosition === 'function') {
          (this.entity as any).setPosition(position);
        } else if (typeof rb.setPosition === 'function') {
          rb.setPosition(position);
        }
        
        // SECOND: Wait a tiny bit for position to settle
        // THIRD: Enable physics AFTER position is set to avoid CCD tunneling
        if (typeof rb.setEnabled === 'function') {
          rb.setEnabled(true);
        }
        
        // THIRD: Reset velocities to clean state - FORCE reset
        if (typeof rb.setLinearVelocity === 'function') {
          rb.setLinearVelocity({ x: 0, y: 0, z: 0 });
          rb.setLinearVelocity({ x: 0, y: 0, z: 0 }); // Double reset to ensure it takes
        }
        if (typeof rb.setAngularVelocity === 'function') {
          rb.setAngularVelocity({ x: 0, y: 0, z: 0 });
        }
        
        // Also reset any accumulated forces
        if (typeof rb.resetForces === 'function') {
          rb.resetForces();
        }
        if (typeof rb.resetTorques === 'function') {
          rb.resetTorques();
        }
        
        // FOURTH: Apply new velocities IMMEDIATELY (matching v2.2 behavior)
        if (velocity) {
          // Apply impulse to give the particle its explosion velocity
          // This matches how it worked in v2.2 when entities were freshly spawned
          if (typeof rb.applyImpulse === 'function') {
            rb.applyImpulse(velocity);
          }
          
          // Add tiny random spin for realism
          if (angularVelocity && typeof rb.applyTorqueImpulse === 'function') {
            rb.applyTorqueImpulse(angularVelocity);
          } else if (typeof rb.applyTorqueImpulse === 'function') {
            const randomSpin = {
              x: (Math.random() - 0.5) * 0.02,
              y: (Math.random() - 0.5) * 0.02,
              z: (Math.random() - 0.5) * 0.02
            };
            rb.applyTorqueImpulse(randomSpin);
          }
        }
        
        // FINALLY: Make visible
        this.entity.setOpacity(this.currentOpacity);
      }
    }
  }
  
  /**
   * Old spawn method for backward compatibility
   */
  spawn(world: World, position: Vector3Like, velocity?: Vector3Like, angularVelocity?: Vector3Like): void {
    this.activate(world, position, velocity, angularVelocity);
  }
  

  update(): boolean {
    if (!this.isActive) return false;
    
    // Update cached position first to avoid Rust aliasing
    this.updateCachedPosition();
    
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

  private applyAnimations(progress: number, _elapsed: number): void {
    // let needsUpdate = false; // Not used currently since we can't update spawned entities
    
    // Scale animation
    if (this.animations?.scaleOverTime) {
      const { start, end, curve } = this.animations.scaleOverTime;
      this.currentScale = AnimationSystem.interpolateValue(start, end, progress, curve);
      // Scale changes not supported on spawned entities
      // needsUpdate = true;
    }
    
    // Color animation
    if (this.animations?.colorOverTime) {
      this.currentColor = AnimationSystem.interpolateColor(
        this.animations.colorOverTime, 
        progress
      );
      // Color changes not supported on spawned entities
      // needsUpdate = true;
    } else if (this.isColorGradient && this.colorGradient) {
      this.currentColor = AnimationSystem.interpolateColor(
        this.colorGradient,
        progress
      );
      // Color changes not supported on spawned entities
      // needsUpdate = true;
    }
    
    // Opacity animation
    if (this.animations?.opacityOverTime) {
      const { start, end, curve } = this.animations.opacityOverTime;
      this.currentOpacity = AnimationSystem.interpolateValue(start, end, progress, curve);
      if (this.entity.opacity !== undefined) {
        // Opacity changes not supported on spawned entities
        // needsUpdate = true;
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
   * Park the particle (true pooling) - disables physics and hides
   */
  park(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    // Debug log for first particle
    if (this.particleId === 0) {
      console.log(`🏁 P#0 PARKING back to underground position`);
    }
    
    if (this.entity.isSpawned) {
      const rb = this.rigidBody || (this.entity as any).rawRigidBody;
      if (rb) {
        // FIRST: Disable physics BEFORE moving to avoid CCD issues
        if (typeof rb.setEnabled === 'function') {
          rb.setEnabled(false);
        }
        
        // SECOND: Reset velocities after physics is disabled
        if (typeof rb.setLinearVelocity === 'function') {
          rb.setLinearVelocity({ x: 0, y: 0, z: 0 });
        }
        if (typeof rb.setAngularVelocity === 'function') {
          rb.setAngularVelocity({ x: 0, y: 0, z: 0 });
        }
        
        // Reset forces too
        if (typeof rb.resetForces === 'function') {
          rb.resetForces();
        }
        if (typeof rb.resetTorques === 'function') {
          rb.resetTorques();
        }
      }
      
      // THIRD: Move to parking position AFTER physics is disabled
      if (typeof (this.entity as any).setPosition === 'function') {
        (this.entity as any).setPosition(this.parkingPosition);
      }
      
      // Hide
      this.entity.setOpacity(0.0);
    }
    
    // Clear cached position
    this._cachedPosition = undefined;
  }
  
  /**
   * Despawn method - parks the particle
   */
  despawn(): void {
    this.park();
  }

  reset(config?: Partial<ParticleConfig>): void {
    if (config) {
      Object.assign(this.config, config);
      
      // For pooling, we don't recreate entities - just update config
      // The next activation will use the new config
      // This avoids despawn/respawn which defeats pooling
    }
    this.isActive = false;
    
    // Clear cached position
    this._cachedPosition = undefined;
  }

  get active(): boolean {
    return this.isActive;
  }
  
  get position(): Vector3Like | undefined {
    // Return cached position to avoid Rust aliasing errors
    return this._cachedPosition;
  }
  
  /**
   * Update cached position - call this once per frame
   */
  updateCachedPosition(): void {
    if (this.entity.position) {
      const pos = this.entity.position;
      this._cachedPosition = { x: pos.x, y: pos.y, z: pos.z };
    } else {
      this._cachedPosition = undefined;
    }
  }
  
  getLifetimeProgress(): number {
    if (!this.isActive) return 0;
    const elapsed = Date.now() - this.spawnTime;
    return Math.min(elapsed / this.lifetime, 1);
  }
  
  /**
   * Debug tracking for first particle
   */
  private debugTrackingInterval?: NodeJS.Timeout;
  
  private startDebugTracking(): void {
    console.log('🔍 Starting debug tracking for Particle #0');
    
    // Track every 250ms
    this.debugTrackingInterval = setInterval(() => {
      if (!this.entity || !this.entity.isSpawned) return;
      
      const rb = this.rigidBody || (this.entity as any).rawRigidBody;
      if (!rb) return;
      
      // Get current state
      const pos = this.entity.position || { x: 0, y: 0, z: 0 };
      const linearVel = rb.linearVelocity || { x: 0, y: 0, z: 0 };
      const angularVel = rb.angularVelocity || { x: 0, y: 0, z: 0 };
      const isEnabled = rb.isEnabled ? rb.isEnabled() : false;
      const isCcd = rb.isCcdEnabled ? rb.isCcdEnabled() : false;
      
      // Calculate velocity magnitude
      const velMagnitude = Math.sqrt(linearVel.x ** 2 + linearVel.y ** 2 + linearVel.z ** 2);
      
      console.log(`📍 P#0 [${this.isActive ? 'ACTIVE' : 'PARKED'}]`, {
        pos: `(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`,
        vel: `(${linearVel.x.toFixed(2)}, ${linearVel.y.toFixed(2)}, ${linearVel.z.toFixed(2)}) mag=${velMagnitude.toFixed(2)}`,
        angVel: `(${angularVel.x.toFixed(2)}, ${angularVel.y.toFixed(2)}, ${angularVel.z.toFixed(2)})`,
        physics: isEnabled ? 'ON' : 'OFF',
        ccd: isCcd ? 'ON' : 'OFF'
      });
    }, 250); // Every 250ms
  }
  
  private stopDebugTracking(): void {
    if (this.debugTrackingInterval) {
      clearInterval(this.debugTrackingInterval);
      this.debugTrackingInterval = undefined;
    }
  }
}