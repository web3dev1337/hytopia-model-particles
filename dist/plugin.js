"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HytopiaParticlesPlugin = void 0;
const ParticleEmitter_1 = require("./ParticleEmitter");
const ParticlePatternsRegistry_1 = require("./ParticlePatternsRegistry");
class HytopiaParticlesPlugin {
    constructor() {
        this.name = 'hytopia-model-particles';
        this.version = '1.0.0';
        this.emitter = null;
    }
    onLoad(world) {
        return __awaiter(this, void 0, void 0, function* () {
            this.emitter = new ParticleEmitter_1.ParticleEmitter(world);
            // Make the particle system available globally
            world.particles = this.emitter;
            // Register default patterns
            ParticlePatternsRegistry_1.ParticlePatternRegistry.registerDefaultPatterns();
        });
    }
    onUnload() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.emitter) {
                // Cleanup any active particles
                this.emitter.cleanup();
                this.emitter = null;
            }
        });
    }
    update(deltaTime) {
        if (this.emitter) {
            this.emitter.update(deltaTime);
        }
    }
}
exports.HytopiaParticlesPlugin = HytopiaParticlesPlugin;
//# sourceMappingURL=plugin.js.map