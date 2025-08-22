"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Particle = void 0;
const hytopia_1 = require("hytopia");
const AnimationSystem_1 = require("./animation/AnimationSystem");
class Particle {
    constructor(config, entityFactory) {
        this.config = config;
        this.entityFactory = entityFactory;
        this.isActive = false;
        this.currentRotation = 0;
        this.rotationVelocity = 0;
        this.isColorGradient = false;
        this.currentOpacity = 1;
        this.lifetime = config.lifetime || 5000;
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
        }
        else {
            this.baseScale = config.modelScale || 1;
            this.currentScale = this.baseScale;
        }
        // Parse color config
        if (config.tintColor && 'keyframes' in config.tintColor) {
            this.isColorGradient = true;
            this.colorGradient = config.tintColor;
            this.baseColor = this.colorGradient.keyframes[0].color;
            this.currentColor = { ...this.baseColor };
        }
        else {
            this.baseColor = config.tintColor || { r: 255, g: 255, b: 255 };
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
        }
        else {
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
        const entityConfig = {
            name: 'Particle',
            modelUri: config.modelUri,
            modelScale: this.currentScale,
            tintColor: this.currentColor,
            opacity: this.currentOpacity
        };
        // Add physics if configured
        if (config.mass && config.mass > 0) {
            entityConfig.rigidBodyOptions = {
                type: hytopia_1.RigidBodyType.DYNAMIC,
                mass: config.mass,
                friction: config.friction || 0.5,
                restitution: config.bounciness || 0.2,
                gravityScale: config.gravityScale ?? (config.useGravity !== false ? 1 : 0),
                ccdEnabled: config.ccdEnabled || false, // CRITICAL: Add CCD support
                colliders: [
                    {
                        shape: hytopia_1.ColliderShape.BALL,
                        radius: 0.1 * this.currentScale,
                        collisionGroups: {
                            belongsTo: [config.collisionGroup || hytopia_1.CollisionGroup.GROUP_2],
                            collidesWith: [config.collisionMask || hytopia_1.CollisionGroup.BLOCK]
                        }
                    }
                ]
            };
        }
        // Use factory if provided, otherwise create entity normally
        if (this.entityFactory) {
            this.entity = this.entityFactory(entityConfig);
        }
        else {
            this.entity = new hytopia_1.Entity(entityConfig);
        }
    }
    spawn(world, position, velocity, angularVelocity) {
        if (this.isActive)
            return;
        this.isActive = true;
        this.spawnTime = Date.now();
        this.velocity = velocity;
        this.angularVelocity = angularVelocity;
        // Reset animation state
        this.currentScale = this.baseScale;
        this.currentColor = { ...this.baseColor };
        this.currentOpacity = this.animations?.opacityOverTime?.start || 1;
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
            }
            catch (physicsError) {
                console.warn('Failed to apply physics to particle:', physicsError);
            }
        }
    }
    update() {
        if (!this.isActive)
            return false;
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
    applyAnimations(progress, elapsed) {
        let needsUpdate = false;
        // Scale animation
        if (this.animations?.scaleOverTime) {
            const { start, end, curve } = this.animations.scaleOverTime;
            this.currentScale = AnimationSystem_1.AnimationSystem.interpolateValue(start, end, progress, curve);
            // Scale changes not supported on spawned entities
            needsUpdate = true;
        }
        // Color animation
        if (this.animations?.colorOverTime) {
            this.currentColor = AnimationSystem_1.AnimationSystem.interpolateColor(this.animations.colorOverTime, progress);
            // Color changes not supported on spawned entities
            needsUpdate = true;
        }
        else if (this.isColorGradient && this.colorGradient) {
            this.currentColor = AnimationSystem_1.AnimationSystem.interpolateColor(this.colorGradient, progress);
            // Color changes not supported on spawned entities
            needsUpdate = true;
        }
        // Opacity animation
        if (this.animations?.opacityOverTime) {
            const { start, end, curve } = this.animations.opacityOverTime;
            this.currentOpacity = AnimationSystem_1.AnimationSystem.interpolateValue(start, end, progress, curve);
            if (this.entity.opacity !== undefined) {
                // Opacity changes not supported on spawned entities
                needsUpdate = true;
            }
        }
    }
    applyRotation(elapsed) {
        const deltaSeconds = elapsed / 1000;
        if (this.animations?.rotationOverTime) {
            const { velocity, acceleration } = this.animations.rotationOverTime;
            let currentVelocity = velocity;
            if (acceleration) {
                currentVelocity += acceleration * deltaSeconds;
            }
            this.currentRotation += currentVelocity * deltaSeconds;
        }
        else if (this.rotationVelocity !== 0) {
            this.currentRotation += this.rotationVelocity * deltaSeconds;
        }
        // Rotation changes not supported on spawned entities
    }
    despawn() {
        if (!this.isActive)
            return;
        this.isActive = false;
        this.entity.despawn();
    }
    reset(config) {
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
    get active() {
        return this.isActive;
    }
    get position() {
        return this.entity.position;
    }
    getLifetimeProgress() {
        if (!this.isActive)
            return 0;
        const elapsed = Date.now() - this.spawnTime;
        return Math.min(elapsed / this.lifetime, 1);
    }
}
exports.Particle = Particle;
//# sourceMappingURL=Particle.js.map