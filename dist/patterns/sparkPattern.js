"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sparkPattern = exports.SparkPattern = void 0;
const basePattern_1 = require("./basePattern");
class SparkPattern extends basePattern_1.Pattern {
    constructor() {
        super();
        this.name = 'spark';
        this.description = 'Quick spark effect for impacts';
        this.defaultConfig = {
            particleCount: 20,
            model: "models/particle_spark.gltf",
            physics: {
                enabled: false
            },
            lifetime: 0.5,
            speed: { min: 2, max: 4 },
            direction: null,
            spread: 180,
            size: 0.1,
            fadeOut: true,
            rotationSpeed: { min: 1, max: 3 }
        };
        // Add hit-specific modifiers
        this.modifiers = Object.assign(Object.assign({}, this.modifiers), { impact: (config, value) => (Object.assign(Object.assign({}, config), { speed: {
                    min: config.speed.min * value,
                    max: config.speed.max * value
                }, particleCount: Math.floor(config.particleCount * Math.sqrt(value)) })), sparkle: (config, value) => (Object.assign(Object.assign({}, config), { rotationSpeed: value ? { min: 360, max: 720 } : undefined, fadeOut: value })) });
    }
}
exports.SparkPattern = SparkPattern;
// Export a singleton instance
exports.sparkPattern = new SparkPattern();
//# sourceMappingURL=sparkPattern.js.map