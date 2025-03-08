"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Particle = void 0;
class Particle {
    constructor(world, modelUri, size) {
        this.inUse = false;
        this.life = 0;
        this.velocity = { x: 0, y: 0, z: 0 };
        // Use HYTOPIA SDK to create entity
        this.entity = world.createEntity({
            model: modelUri,
            scale: size || 1
        });
    }
    spawn(world, position, velocity, lifetime, usePhysics, gravity) {
        this.inUse = true;
        this.life = lifetime;
        this.velocity = Object.assign({}, velocity);
        // Note: This method will need to be updated with actual entity spawning logic once we have access to the SDK
    }
    update(deltaTime, usePhysics, gravity) {
        if (!this.inUse)
            return;
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
    despawn() {
        if (!this.inUse)
            return;
        this.inUse = false;
        this.velocity = { x: 0, y: 0, z: 0 };
        // Note: This method will need to be updated with actual entity despawning logic once we have the SDK
    }
    isInUse() {
        return this.inUse;
    }
}
exports.Particle = Particle;
//# sourceMappingURL=Particle.js.map