"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pattern = void 0;
class Pattern {
    constructor() {
        this.modifiers = this.getDefaultModifiers();
    }
    getDefaultModifiers() {
        return {
            intensity: (config, value) => (Object.assign(Object.assign({}, config), { particleCount: Math.floor(config.particleCount * value), speed: {
                    min: config.speed.min * value,
                    max: config.speed.max * value
                } })),
            scale: (config, value) => (Object.assign(Object.assign({}, config), { size: config.size * value })),
            duration: (config, value) => (Object.assign(Object.assign({}, config), { lifetime: config.lifetime * value }))
        };
    }
    applyModifiers(config, modifiers) {
        if (!modifiers || !this.modifiers)
            return config;
        let result = Object.assign({}, config);
        for (const [key, value] of Object.entries(modifiers)) {
            if (this.modifiers[key]) {
                result = this.modifiers[key](result, value);
            }
        }
        return result;
    }
    generate(overrides) {
        const baseConfig = Object.assign({}, this.defaultConfig);
        const withOverrides = Object.assign(Object.assign({}, baseConfig), overrides);
        return this.applyModifiers(withOverrides, overrides === null || overrides === void 0 ? void 0 : overrides.patternModifiers);
    }
}
exports.Pattern = Pattern;
//# sourceMappingURL=basePattern.js.map