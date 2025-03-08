import { BasePattern, ParticleEffectConfig } from '../types';

export abstract class Pattern implements BasePattern {
  abstract name: string;
  abstract description?: string;
  abstract defaultConfig: ParticleEffectConfig;
  
  modifiers?: {
    [key: string]: (config: ParticleEffectConfig, value: any) => ParticleEffectConfig;
  };

  constructor() {
    this.modifiers = this.getDefaultModifiers();
  }

  protected getDefaultModifiers() {
    return {
      intensity: (config: ParticleEffectConfig, value: number) => ({
        ...config,
        particleCount: Math.floor(config.particleCount * value),
        speed: {
          min: config.speed.min * value,
          max: config.speed.max * value
        }
      }),
      scale: (config: ParticleEffectConfig, value: number) => ({
        ...config,
        size: config.size * value
      }),
      duration: (config: ParticleEffectConfig, value: number) => ({
        ...config,
        lifetime: config.lifetime * value
      })
    };
  }

  applyModifiers(config: ParticleEffectConfig, modifiers?: { [key: string]: any }): ParticleEffectConfig {
    if (!modifiers || !this.modifiers) return config;

    let result = { ...config };
    for (const [key, value] of Object.entries(modifiers)) {
      if (this.modifiers[key]) {
        result = this.modifiers[key](result, value);
      }
    }
    return result;
  }

  generate(overrides?: Partial<ParticleEffectConfig>): ParticleEffectConfig {
    const baseConfig = { ...this.defaultConfig };
    const withOverrides = { ...baseConfig, ...overrides };
    return this.applyModifiers(withOverrides, overrides?.patternModifiers);
  }
} 