"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeParticles = initializeParticles;
const hytopia_1 = require("hytopia");
const ParticleEmitter_1 = require("./core/ParticleEmitter");
const ParticlePatternsRegistry_1 = require("./patterns/ParticlePatternsRegistry");
function initializeParticles() {
    (0, hytopia_1.startServer)((world) => {
        const emitter = new ParticleEmitter_1.ParticleEmitter(world);
        // Register default patterns
        ParticlePatternsRegistry_1.ParticlePatternRegistry.registerDefaultPatterns();
        return {
            update: (deltaTime) => emitter.update(deltaTime),
            cleanup: () => emitter.cleanup()
        };
    });
}
//# sourceMappingURL=plugin.js.map