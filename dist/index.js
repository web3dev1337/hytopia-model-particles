"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamPattern = exports.sparkPattern = exports.explosionPattern = exports.Particle = exports.ParticlePatternRegistry = exports.ParticleEmitter = exports.initializeParticleServer = exports.getEmitterInstance = exports.initializeParticles = void 0;
// Main exports
var plugin_1 = require("./plugin");
Object.defineProperty(exports, "initializeParticles", { enumerable: true, get: function () { return plugin_1.initializeParticles; } });
Object.defineProperty(exports, "getEmitterInstance", { enumerable: true, get: function () { return plugin_1.getEmitterInstance; } });
Object.defineProperty(exports, "initializeParticleServer", { enumerable: true, get: function () { return plugin_1.initializeParticleServer; } });
var ParticleEmitter_1 = require("./core/ParticleEmitter");
Object.defineProperty(exports, "ParticleEmitter", { enumerable: true, get: function () { return ParticleEmitter_1.ParticleEmitter; } });
var ParticlePatternsRegistry_1 = require("./patterns/ParticlePatternsRegistry");
Object.defineProperty(exports, "ParticlePatternRegistry", { enumerable: true, get: function () { return ParticlePatternsRegistry_1.ParticlePatternRegistry; } });
var Particle_1 = require("./core/Particle");
Object.defineProperty(exports, "Particle", { enumerable: true, get: function () { return Particle_1.Particle; } });
__exportStar(require("./types"), exports);
// Pattern exports
var explosionPattern_1 = require("./patterns/built-in/explosionPattern");
Object.defineProperty(exports, "explosionPattern", { enumerable: true, get: function () { return explosionPattern_1.explosionPattern; } });
var sparkPattern_1 = require("./patterns/built-in/sparkPattern");
Object.defineProperty(exports, "sparkPattern", { enumerable: true, get: function () { return sparkPattern_1.sparkPattern; } });
var streamPattern_1 = require("./patterns/built-in/streamPattern");
Object.defineProperty(exports, "streamPattern", { enumerable: true, get: function () { return streamPattern_1.streamPattern; } });
//# sourceMappingURL=index.js.map