import { ParticleEffectConfig } from '../types';
import { Pattern } from '../patterns/base/basePattern';

export class SparkPattern extends Pattern {
  name = 'spark';
  description = 'Quick spark effect for impacts';
  defaultConfig: ParticleEffectConfig = {
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

  constructor() {
    super();
    // Add hit-specific modifiers
    this.modifiers = {
      ...this.modifiers,
      impact: (config: ParticleEffectConfig, value: number) => ({
        ...config,
        speed: {
          min: config.speed.min * value,
          max: config.speed.max * value
        },
        particleCount: Math.floor(config.particleCount * Math.sqrt(value))
      }),
      sparkle: (config: ParticleEffectConfig, value: boolean) => ({
        ...config,
        rotationSpeed: value ? { min: 360, max: 720 } : undefined,
        fadeOut: value
      })
    };
  }
}

// Export a singleton instance
export const sparkPattern = new SparkPattern(); 