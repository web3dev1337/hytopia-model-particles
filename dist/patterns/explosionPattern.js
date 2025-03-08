"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explosionPattern = exports.ExplosionPattern = void 0;
const basePattern_1 = require("./basePattern");
class ExplosionPattern extends basePattern_1.Pattern {
    constructor() {
        super();
        this.name = 'explosion';
        this.description = 'A spherical burst of particles with physics and gravity';
        this.defaultConfig = {
            particleCount: 50,
            model: "models/particle_rock.gltf",
            physics: {
                enabled: true,
                rigidBody: {
                    type: 'dynamic',
                    useGravity: true,
                    gravityScale: 1,
                    material: {
                        restitution: 0.3,
                        friction: 0.8,
                        density: 1.0
                    }
                }
            },
            lifetime: 3,
            speed: { min: 5, max: 10 },
            direction: null, // Emit in all directions
            spread: 360, // Full sphere emission
            size: 0.2,
        };
        // Add explosion-specific modifiers
        this.modifiers = Object.assign(Object.assign({}, this.modifiers), { force: (config, value) => (Object.assign(Object.assign({}, config), { speed: {
                    min: config.speed.min * value,
                    max: config.speed.max * value
                } })), debris: (config, value) => (Object.assign(Object.assign({}, config), { physics: Object.assign(Object.assign({}, config.physics), { enabled: value, rigidBody: value ? {
                        type: 'dynamic',
                        useGravity: value,
                        material: {
                            restitution: 0.3,
                            friction: 0.8,
                            density: 1.0
                        }
                    } : undefined }) })) });
    }
}
exports.ExplosionPattern = ExplosionPattern;
// Export a singleton instance
exports.explosionPattern = new ExplosionPattern();
//# sourceMappingURL=explosionPattern.js.map