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
exports.ColliderShape = exports.RigidBodyType = exports.Entity = exports.World = exports.YAMLLoader = exports.StreamPattern = exports.ExplosionPattern = exports.Pattern = exports.ParticleSystem = exports.Particle = void 0;
var Particle_1 = require("./Particle");
Object.defineProperty(exports, "Particle", { enumerable: true, get: function () { return Particle_1.Particle; } });
var ParticleSystem_1 = require("./ParticleSystem");
Object.defineProperty(exports, "ParticleSystem", { enumerable: true, get: function () { return ParticleSystem_1.ParticleSystem; } });
var Pattern_1 = require("./patterns/Pattern");
Object.defineProperty(exports, "Pattern", { enumerable: true, get: function () { return Pattern_1.Pattern; } });
var ExplosionPattern_1 = require("./patterns/ExplosionPattern");
Object.defineProperty(exports, "ExplosionPattern", { enumerable: true, get: function () { return ExplosionPattern_1.ExplosionPattern; } });
var StreamPattern_1 = require("./patterns/StreamPattern");
Object.defineProperty(exports, "StreamPattern", { enumerable: true, get: function () { return StreamPattern_1.StreamPattern; } });
var YAMLLoader_1 = require("./YAMLLoader");
Object.defineProperty(exports, "YAMLLoader", { enumerable: true, get: function () { return YAMLLoader_1.YAMLLoader; } });
__exportStar(require("./types"), exports);
// Re-export Hytopia types that users might need
var hytopia_1 = require("hytopia");
Object.defineProperty(exports, "World", { enumerable: true, get: function () { return hytopia_1.World; } });
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return hytopia_1.Entity; } });
Object.defineProperty(exports, "RigidBodyType", { enumerable: true, get: function () { return hytopia_1.RigidBodyType; } });
Object.defineProperty(exports, "ColliderShape", { enumerable: true, get: function () { return hytopia_1.ColliderShape; } });
//# sourceMappingURL=index.js.map