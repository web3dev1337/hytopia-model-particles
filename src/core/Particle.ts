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
  private physicsResetPending: boolean = false;
  
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
    // DISABLED: Causes Rust aliasing errors when accessing entity properties
    // Particles are confirmed working - parking at Y=-50 and reusing properly
    /*
    if (this.particleId === 0) {
      this.startDebugTracking();
    }
    */
    
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
    
    // IMMEDIATELY disable physics to reduce overhead - no timeout!
    const rb = (this.entity as any).rawRigidBody;
    if (rb && typeof rb.setEnabled === 'function') {
      // CRITICAL: Consolidate all rigid body operations into ONE try-catch to prevent Rust aliasing
      try {
        // Clear velocities BEFORE disabling
        const zeroLinear = { x: 0, y: 0, z: 0 };
        const zeroAngular = { x: 0, y: 0, z: 0 };

        if (typeof rb.setLinearVelocity === 'function') {
          rb.setLinearVelocity(zeroLinear);
        }
        if (typeof rb.setAngularVelocity === 'function') {
          rb.setAngularVelocity(zeroAngular);
        }
        if (typeof rb.setGravityScale === 'function') {
          rb.setGravityScale(0); // No gravity when parked
        }

        rb.setEnabled(false); // Disable physics when parked

        // Try to disable CCD if possible
        if (typeof rb.setCcdEnabled === 'function') {
          rb.setCcdEnabled(false);
        }
        if (typeof rb.enableCcd === 'function') {
          rb.enableCcd(false);
        }
      } catch (e) {
        // Ignore physics errors
      }

      this.rigidBody = rb;
    } else {
      // If rigidBody not available immediately, try again shortly
      setTimeout(() => {
        const rb = (this.entity as any).rawRigidBody;
        if (rb && typeof rb.setEnabled === 'function') {
          // CRITICAL: Consolidate all rigid body operations to prevent Rust aliasing
          try {
            const zeroLinear = { x: 0, y: 0, z: 0 };
            const zeroAngular = { x: 0, y: 0, z: 0 };

            // Clear velocities before disabling
            if (typeof rb.setLinearVelocity === 'function') {
              rb.setLinearVelocity(zeroLinear);
            }
            if (typeof rb.setAngularVelocity === 'function') {
              rb.setAngularVelocity(zeroAngular);
            }
            if (typeof rb.setGravityScale === 'function') {
              rb.setGravityScale(0);
            }
            rb.setEnabled(false);
          } catch (e) {
            // Ignore physics errors
          }

          this.rigidBody = rb;
        }
      }, 10);
    }
    
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
        // Physics should already be disabled from parking, but make sure
        if (typeof rb.isEnabled === 'function' && rb.isEnabled()) {
          console.warn('⚠️ Physics was still enabled when activating particle!');
          rb.setEnabled(false);
          
          // CRITICAL: Wait for physics to actually disable before moving
          setTimeout(() => {
            this.performActivation(position, velocity, angularVelocity, rb);
          }, 10);
          return;
        }
        
        // Physics is already disabled, safe to move
        this.performActivation(position, velocity, angularVelocity, rb);
      }
    }
  }
  
  private performActivation(position: Vector3Like, velocity?: Vector3Like, angularVelocity?: Vector3Like, rb?: any): void {
    // CRITICAL: Set spawn time and active state
    this.isActive = true;
    this.spawnTime = Date.now();
    this.velocity = velocity;
    this.angularVelocity = angularVelocity;

    // Debug log for first particle
    if (this.particleId === 0) {
      console.log(`🚀 P#0 DELAYED ACTIVATION at position:`, position, `with velocity:`, velocity);
    }

    // CRITICAL: Consolidate ALL rigid body operations into ONE try-catch to prevent Rust aliasing
    if (rb) {
      try {
        // Clear old velocities while physics is disabled
        const zeroLinear = { x: 0, y: 0, z: 0 };
        const zeroAngular = { x: 0, y: 0, z: 0 };

        if (typeof rb.setLinearVelocity === 'function') {
          rb.setLinearVelocity(zeroLinear);
        }
        if (typeof rb.setAngularVelocity === 'function') {
          rb.setAngularVelocity(zeroAngular);
        }

        // Re-enable physics BEFORE applying velocity
        if (typeof rb.setEnabled === 'function') {
          rb.setEnabled(true);
        }
        if (typeof rb.setGravityScale === 'function') {
          rb.setGravityScale(this.config.useGravity !== false ? 1.0 : 0.0);
        }

        // Apply NEW velocity AFTER physics is enabled
        if (velocity && typeof rb.applyImpulse === 'function') {
          rb.applyImpulse(velocity);
        }
        if (angularVelocity && typeof rb.applyTorqueImpulse === 'function') {
          rb.applyTorqueImpulse(angularVelocity);
        }
      } catch (e) {
        // Ignore all physics errors
      }
    }

    // Move to position (separate try-catch for entity operations)
    try {
      if (typeof (this.entity as any).setPosition === 'function') {
        (this.entity as any).setPosition(position);
      }
    } catch (e) { /* Ignore */ }

    // Make visible (separate try-catch)
    try {
      this.entity.setOpacity(this.currentOpacity);
    } catch (e) { /* Ignore */ }
  }
  
  /**
   * Old spawn method for backward compatibility
   */
  spawn(world: World, position: Vector3Like, velocity?: Vector3Like, angularVelocity?: Vector3Like): void {
    this.activate(world, position, velocity, angularVelocity);
  }
  

  update(): boolean {
    if (!this.isActive) return false;

    // CRITICAL FIX: Skip position updates entirely - they cause Rust aliasing errors
    // Position caching is not essential for particle functionality
    // this.updateCachedPosition();

    const elapsed = Date.now() - this.spawnTime;
    if (elapsed >= this.lifetime) {
      // Log when particles expire
      if (this.particleId < 5) {
        console.log(`⏰ P#${this.particleId} EXPIRED after ${elapsed}ms (lifetime: ${this.lifetime}ms)`);
      }
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
   * Park the particle (true pooling) - disable physics and hide
   * Disabling physics prevents unwanted movement while parked
   */
  park(): void {
    if (!this.isActive) return;

    this.isActive = false;

    // Debug log for first particle
    if (this.particleId === 0) {
      console.log(`🏁 P#0 PARKING back to underground position at time: ${Date.now() - this.spawnTime}ms after spawn`);
    }

    if (this.entity.isSpawned) {
      const rb = this.rigidBody || (this.entity as any).rawRigidBody;
      const parkingPosition = { ...this.parkingPosition };

      // Hide immediately so the particle disappears even if physics reset is deferred
      try {
        this.entity.setOpacity(0.0);
      } catch (e) { /* Ignore */ }

      this.physicsResetPending = true;

      this.deferPhysicsWork(() => {
        try {
          if (rb) {
            // CRITICAL: Consolidate all velocity operations into ONE try-catch to minimize Rust aliasing
            try {
              // Clear linear velocity
              if (typeof rb.resetLinearVelocity === 'function') {
                rb.resetLinearVelocity();
              } else if (typeof rb.setLinearVelocity === 'function') {
                const zeroLinear = { x: 0, y: 0, z: 0 };
                rb.setLinearVelocity(zeroLinear);
              }

              // Clear angular velocity (same try-catch to avoid aliasing)
              if (typeof rb.resetAngularVelocity === 'function') {
                rb.resetAngularVelocity();
              } else if (typeof rb.setAngularVelocity === 'function') {
                const zeroAngular = { x: 0, y: 0, z: 0 };
                rb.setAngularVelocity(zeroAngular);
              }

              // Set gravity scale (same try-catch)
              if (typeof rb.setGravityScale === 'function') {
                rb.setGravityScale(0);
              }

              // Disable physics last (same try-catch)
              if (typeof rb.setEnabled === 'function') {
                rb.setEnabled(false);
              }
            } catch (e) {
              // Ignore all physics errors - particle will still be hidden and parked
            }
          }

          // Move to parking position (far underground) after physics settles
          // Separate try-catch for position to avoid aliasing with rb operations
          try {
            if (typeof (this.entity as any).setPosition === 'function') {
              (this.entity as any).setPosition(parkingPosition);
            }
          } catch (e) { /* Ignore */ }
        } finally {
          this.physicsResetPending = false;
        }
      });
    } else {
      // Even if entity isn't spawned, ensure opacity reset doesn't throw
      try {
        this.entity.setOpacity(0.0);
      } catch (e) { /* Ignore */ }
    }

    // Clear internal velocity tracking
    this.velocity = undefined;
    this.angularVelocity = undefined;

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
      
      // Update lifetime if provided in new config
      if (config.lifetime !== undefined) {
        this.lifetime = config.lifetime;
      }
      
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
    // CRITICAL FIX: Extract each coordinate in separate try-catch to handle Rust borrow checker
    // Even storing position once can fail if Rust has it borrowed during ANY coordinate access
    let x: number | undefined;
    let y: number | undefined;
    let z: number | undefined;

    // Store position reference ONCE
    let pos: any;
    try {
      pos = this.entity.position;
    } catch (e) {
      return; // Can't access position at all, keep previous cache
    }

    // Now extract coordinates with individual try-catch for each
    try {
      x = pos.x;
    } catch (e) { }

    try {
      y = pos.y;
    } catch (e) { }

    try {
      z = pos.z;
    } catch (e) { }

    // Only update cache if we got all three coordinates
    if (x !== undefined && y !== undefined && z !== undefined) {
      this._cachedPosition = { x, y, z };
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

    // Track every 300ms
    this.debugTrackingInterval = setInterval(() => {
      if (!this.entity || !this.entity.isSpawned) return;

      const rb = this.rigidBody || (this.entity as any).rawRigidBody;
      if (!rb) return;

      // FIX: Wrap each property access in try-catch and store ONCE to avoid Rust aliasing
      let pos = { x: 0, y: 0, z: 0 };
      let linearVel = { x: 0, y: 0, z: 0 };
      let angularVel = { x: 0, y: 0, z: 0 };

      try {
        const entityPos = this.entity.position;
        pos = { x: entityPos.x, y: entityPos.y, z: entityPos.z };
      } catch (e) { /* Ignore aliasing errors */ }

      try {
        const rbLinearVel = rb.linearVelocity;
        linearVel = { x: rbLinearVel.x, y: rbLinearVel.y, z: rbLinearVel.z };
      } catch (e) { /* Ignore aliasing errors */ }

      try {
        const rbAngularVel = rb.angularVelocity;
        angularVel = { x: rbAngularVel.x, y: rbAngularVel.y, z: rbAngularVel.z };
      } catch (e) { /* Ignore aliasing errors */ }
      const isEnabled = rb.isEnabled ? rb.isEnabled() : false;
      const isCcd = rb.isCcdEnabled ? rb.isCcdEnabled() : false;
      const mass = typeof rb.mass === 'number' ? rb.mass : 'N/A';
      const gravityScale = typeof rb.gravityScale === 'number' ? rb.gravityScale : 'N/A';
      const linearDamping = typeof rb.linearDamping === 'number' ? rb.linearDamping : 'N/A';
      const angularDamping = typeof rb.angularDamping === 'number' ? rb.angularDamping : 'N/A';
      const isSleeping = rb.isSleeping ? rb.isSleeping() : false;
      const isMoving = rb.isMoving ? rb.isMoving() : false;
      
      // Calculate velocity magnitude
      const velMagnitude = Math.sqrt(linearVel.x ** 2 + linearVel.y ** 2 + linearVel.z ** 2);
      
      console.log(`📍 P#0 [${this.isActive ? 'ACTIVE' : 'PARKED'}]`, {
        pos: `(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`,
        vel: `(${linearVel.x.toFixed(2)}, ${linearVel.y.toFixed(2)}, ${linearVel.z.toFixed(2)}) mag=${velMagnitude.toFixed(2)}`,
        angVel: `(${angularVel.x.toFixed(2)}, ${angularVel.y.toFixed(2)}, ${angularVel.z.toFixed(2)})`,
        physics: isEnabled ? 'ON' : 'OFF',
        ccd: isCcd ? 'ON' : 'OFF',
        mass: typeof mass === 'number' ? mass.toFixed(2) : mass,
        gravityScale: typeof gravityScale === 'number' ? gravityScale.toFixed(2) : gravityScale,
        linearDamping: typeof linearDamping === 'number' ? linearDamping.toFixed(2) : linearDamping,
        angularDamping: typeof angularDamping === 'number' ? angularDamping.toFixed(2) : angularDamping,
        sleeping: isSleeping ? 'YES' : 'NO',
        moving: isMoving ? 'YES' : 'NO'
      });
    }, 300); // Every 300ms
  }
  
  private stopDebugTracking(): void {
    if (this.debugTrackingInterval) {
      clearInterval(this.debugTrackingInterval);
      this.debugTrackingInterval = undefined;
    }
  }

  private deferPhysicsWork(work: () => void): void {
    try {
      if (typeof queueMicrotask === 'function') {
        queueMicrotask(work);
        return;
      }
    } catch (e) {
      // Ignore, we'll fall back to setTimeout
    }

    setTimeout(work, 0);
  }

  public isPhysicsResetPending(): boolean {
    return this.physicsResetPending;
  }

}
