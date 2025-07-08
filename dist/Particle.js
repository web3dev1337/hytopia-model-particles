"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Particle = void 0;
const hytopia_1 = require("hytopia");
class Particle {
    constructor(config, entityFactory) {
        this.config = config;
        this.entityFactory = entityFactory;
        this.isActive = false;
        this.lifetime = config.lifetime || 5000;
        this.spawnTime = 0;
        const entityConfig = {
            name: 'Particle',
            modelUri: config.modelUri,
            modelScale: config.modelScale || 1,
            tintColor: config.tintColor
        };
        // Add physics if configured
        if (config.mass && config.mass > 0) {
            entityConfig.rigidBodyOptions = {
                type: hytopia_1.RigidBodyType.DYNAMIC,
                mass: config.mass,
                friction: config.friction || 0.5,
                restitution: config.bounciness || 0.2,
                gravityScale: config.useGravity !== false ? 1 : 0,
                colliders: [
                    {
                        shape: hytopia_1.ColliderShape.BALL,
                        radius: 0.1,
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
                // If physics fails, continue without it
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
        return true;
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
            // If model or physics changed, we need to recreate the entity
            if ((config.modelUri && config.modelUri !== this.entity.modelUri) ||
                config.mass !== undefined || config.friction !== undefined ||
                config.bounciness !== undefined || config.useGravity !== undefined) {
                // Only despawn if the entity is actually spawned
                if (this.entity.isSpawned) {
                    this.entity.despawn();
                }
                const entityConfig = {
                    name: 'Particle',
                    modelUri: this.config.modelUri,
                    modelScale: this.config.modelScale || 1,
                    tintColor: this.config.tintColor
                };
                // Add physics if configured
                if (this.config.mass && this.config.mass > 0) {
                    entityConfig.rigidBodyOptions = {
                        type: hytopia_1.RigidBodyType.DYNAMIC,
                        mass: this.config.mass,
                        friction: this.config.friction || 0.5,
                        restitution: this.config.bounciness || 0.2,
                        gravityScale: this.config.useGravity !== false ? 1 : 0,
                        colliders: [
                            {
                                shape: hytopia_1.ColliderShape.BALL,
                                radius: 0.1,
                                collisionGroups: {
                                    belongsTo: [this.config.collisionGroup || hytopia_1.CollisionGroup.GROUP_2],
                                    collidesWith: [this.config.collisionMask || hytopia_1.CollisionGroup.BLOCK]
                                }
                            }
                        ]
                    };
                }
                if (this.entityFactory) {
                    this.entity = this.entityFactory(entityConfig);
                }
                else {
                    this.entity = new hytopia_1.Entity(entityConfig);
                }
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
}
exports.Particle = Particle;
//# sourceMappingURL=Particle.js.map