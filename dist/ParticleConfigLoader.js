"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadParticleConfig = loadParticleConfig;
exports.validateConfig = validateConfig;
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
function loadParticleConfig(filePath) {
    try {
        const raw = (0, fs_1.readFileSync)(filePath, 'utf8');
        if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
            return (0, js_yaml_1.load)(raw);
        }
        if (filePath.endsWith('.json')) {
            return JSON.parse(raw);
        }
        // Try YAML first, then JSON if YAML fails
        try {
            return (0, js_yaml_1.load)(raw);
        }
        catch (_a) {
            return JSON.parse(raw);
        }
    }
    catch (error) {
        console.error(`Error loading particle config from ${filePath}:`, error);
        throw error;
    }
}
function validateConfig(config) {
    if (!config.effects || typeof config.effects !== 'object') {
        throw new Error('Config must contain an "effects" object');
    }
    for (const [effectName, effect] of Object.entries(config.effects)) {
        if (!effect.particleCount || effect.particleCount < 1) {
            throw new Error(`Effect "${effectName}" must have a positive particleCount`);
        }
        if (!effect.lifetime || effect.lifetime <= 0) {
            throw new Error(`Effect "${effectName}" must have a positive lifetime`);
        }
        if (!effect.speed || typeof effect.speed.min !== 'number' || typeof effect.speed.max !== 'number') {
            throw new Error(`Effect "${effectName}" must have valid speed.min and speed.max values`);
        }
        if (effect.speed.min > effect.speed.max) {
            throw new Error(`Effect "${effectName}" speed.min cannot be greater than speed.max`);
        }
        if (typeof effect.spread !== 'number' || effect.spread < 0 || effect.spread > 360) {
            throw new Error(`Effect "${effectName}" must have a spread value between 0 and 360`);
        }
        if (typeof effect.size !== 'number' || effect.size <= 0) {
            throw new Error(`Effect "${effectName}" must have a positive size value`);
        }
    }
}
//# sourceMappingURL=ParticleConfigLoader.js.map