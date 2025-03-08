"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticlePatternRegistry = void 0;
const explosionPattern_1 = require("./patterns/explosionPattern");
const streamPattern_1 = require("./patterns/streamPattern");
const sparkPattern_1 = require("./patterns/sparkPattern");
class ParticlePatternRegistry {
    static registerDefaultPatterns() {
        // Register default patterns
        this.registerPattern(explosionPattern_1.explosionPattern);
        this.registerPattern(streamPattern_1.streamPattern);
        this.registerPattern(sparkPattern_1.sparkPattern);
    }
    static registerPattern(pattern) {
        if (this.patterns.has(pattern.name)) {
            console.warn(`Pattern "${pattern.name}" already exists and will be overwritten.`);
        }
        this.patterns.set(pattern.name, pattern);
    }
    static getPattern(name) {
        return this.patterns.get(name);
    }
    static generateConfig(patternName, overrides) {
        const pattern = this.getPattern(patternName);
        if (!pattern) {
            throw new Error(`Pattern "${patternName}" not found.`);
        }
        return pattern.generate(overrides);
    }
    static listPatterns() {
        return Array.from(this.patterns.values()).map(pattern => ({
            name: pattern.name,
            description: pattern.description
        }));
    }
}
exports.ParticlePatternRegistry = ParticlePatternRegistry;
ParticlePatternRegistry.patterns = new Map();
//# sourceMappingURL=ParticlePatternsRegistry.js.map