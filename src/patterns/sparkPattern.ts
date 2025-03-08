import { ParticleEffectConfig } from '../types';
import { Pattern } from './basePattern';

export class SparkPattern extends Pattern {
  name = 'spark';
  description = 'Quick sparks or flashes at a point - perfect for impacts, hits, collisions, or any instant effect';
  defaultConfig: ParticleEffectConfig = {
    particleCount: 10,
    model: "models/particle_spark.gltf",
    usePhysics: false,
    gravity: false,
    lifetime: 0.5,
    speed: { min: 2, max: 4 },
    direction: null,  // Will be set based on hit direction
    spread: 60,      // Cone spread from hit point
    size: 0.1,
    fadeOut: true,   // Sparks fade out over lifetime
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