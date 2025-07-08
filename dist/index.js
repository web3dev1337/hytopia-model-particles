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
exports.ColliderShape = exports.RigidBodyType = exports.Entity = exports.World = exports.EffectQueue = exports.CompositePattern = exports.PatternRegistry = exports.EnhancedYAMLLoader = exports.YAMLLoader = exports.PerformanceMonitor = exports.AnimationSystem = exports.FountainPattern = exports.RingPattern = exports.WavePattern = exports.SpiralPattern = exports.StreamPattern = exports.ExplosionPattern = exports.Pattern = exports.ParticleSystem = exports.Particle = void 0;
// Core exports
var Particle_1 = require("./Particle");
Object.defineProperty(exports, "Particle", { enumerable: true, get: function () { return Particle_1.Particle; } });
var ParticleSystem_1 = require("./ParticleSystem");
Object.defineProperty(exports, "ParticleSystem", { enumerable: true, get: function () { return ParticleSystem_1.ParticleSystem; } });
// Pattern exports
var Pattern_1 = require("./patterns/Pattern");
Object.defineProperty(exports, "Pattern", { enumerable: true, get: function () { return Pattern_1.Pattern; } });
var ExplosionPattern_1 = require("./patterns/ExplosionPattern");
Object.defineProperty(exports, "ExplosionPattern", { enumerable: true, get: function () { return ExplosionPattern_1.ExplosionPattern; } });
var StreamPattern_1 = require("./patterns/StreamPattern");
Object.defineProperty(exports, "StreamPattern", { enumerable: true, get: function () { return StreamPattern_1.StreamPattern; } });
var SpiralPattern_1 = require("./patterns/SpiralPattern");
Object.defineProperty(exports, "SpiralPattern", { enumerable: true, get: function () { return SpiralPattern_1.SpiralPattern; } });
var WavePattern_1 = require("./patterns/WavePattern");
Object.defineProperty(exports, "WavePattern", { enumerable: true, get: function () { return WavePattern_1.WavePattern; } });
var RingPattern_1 = require("./patterns/RingPattern");
Object.defineProperty(exports, "RingPattern", { enumerable: true, get: function () { return RingPattern_1.RingPattern; } });
var FountainPattern_1 = require("./patterns/FountainPattern");
Object.defineProperty(exports, "FountainPattern", { enumerable: true, get: function () { return FountainPattern_1.FountainPattern; } });
// Animation system exports
var AnimationSystem_1 = require("./animation/AnimationSystem");
Object.defineProperty(exports, "AnimationSystem", { enumerable: true, get: function () { return AnimationSystem_1.AnimationSystem; } });
// Performance monitoring exports
var PerformanceMonitor_1 = require("./performance/PerformanceMonitor");
Object.defineProperty(exports, "PerformanceMonitor", { enumerable: true, get: function () { return PerformanceMonitor_1.PerformanceMonitor; } });
// Configuration exports
var YAMLLoader_1 = require("./YAMLLoader");
Object.defineProperty(exports, "YAMLLoader", { enumerable: true, get: function () { return YAMLLoader_1.YAMLLoader; } });
var EnhancedYAMLLoader_1 = require("./config/EnhancedYAMLLoader");
Object.defineProperty(exports, "EnhancedYAMLLoader", { enumerable: true, get: function () { return EnhancedYAMLLoader_1.EnhancedYAMLLoader; } });
// Registry exports
var PatternRegistry_1 = require("./registry/PatternRegistry");
Object.defineProperty(exports, "PatternRegistry", { enumerable: true, get: function () { return PatternRegistry_1.PatternRegistry; } });
Object.defineProperty(exports, "CompositePattern", { enumerable: true, get: function () { return PatternRegistry_1.CompositePattern; } });
// Queue exports
var EffectQueue_1 = require("./queue/EffectQueue");
Object.defineProperty(exports, "EffectQueue", { enumerable: true, get: function () { return EffectQueue_1.EffectQueue; } });
// Type exports
__exportStar(require("./types"), exports);
// Re-export Hytopia types that users might need
var hytopia_1 = require("hytopia");
Object.defineProperty(exports, "World", { enumerable: true, get: function () { return hytopia_1.World; } });
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return hytopia_1.Entity; } });
Object.defineProperty(exports, "RigidBodyType", { enumerable: true, get: function () { return hytopia_1.RigidBodyType; } });
Object.defineProperty(exports, "ColliderShape", { enumerable: true, get: function () { return hytopia_1.ColliderShape; } });
//# sourceMappingURL=index.js.map