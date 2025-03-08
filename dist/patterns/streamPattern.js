"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamPattern = exports.StreamPattern = void 0;
const basePattern_1 = require("./basePattern");
class StreamPattern extends basePattern_1.Pattern {
    constructor() {
        super();
        this.name = 'stream';
        this.description = 'Continuous stream of particles in a direction';
        this.defaultConfig = {
            particleCount: 5,
            model: "models/particle_drop.gltf",
            physics: {
                enabled: false
            },
            lifetime: 1,
            speed: { min: 3, max: 5 },
            direction: { x: 0, y: 1, z: 0 },
            spread: 15,
            size: 0.15,
            fadeOut: true
        };
        this.modifiers = Object.assign(Object.assign({}, this.modifiers), { spread: (config, value) => (Object.assign(Object.assign({}, config), { spread: Math.max(0, Math.min(360, value)) })), direction: (config, value) => (Object.assign(Object.assign({}, config), { direction: value })), flow: (config, value) => (Object.assign(Object.assign({}, config), { particleCount: Math.floor(config.particleCount * value), speed: {
                    min: config.speed.min * Math.sqrt(value),
                    max: config.speed.max * Math.sqrt(value)
                } })) });
    }
}
exports.StreamPattern = StreamPattern;
// Export a singleton instance
exports.streamPattern = new StreamPattern();
//# sourceMappingURL=streamPattern.js.map