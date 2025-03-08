import { ParticleEffectConfig } from '../types';
import { Pattern } from './basePattern';

export class StreamPattern extends Pattern {
  name = 'stream';
  description = 'Continuous stream of particles in a direction';
  defaultConfig: ParticleEffectConfig = {
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

  constructor() {
    super();
    this.modifiers = {
      ...this.modifiers,
      spread: (config: ParticleEffectConfig, value: number) => ({
        ...config,
        spread: Math.max(0, Math.min(360, value))
      }),
      direction: (config: ParticleEffectConfig, value: { x: number; y: number; z: number }) => ({
        ...config,
        direction: value
      }),
      flow: (config: ParticleEffectConfig, value: number) => ({
        ...config,
        particleCount: Math.floor(config.particleCount * value),
        speed: {
          min: config.speed.min * Math.sqrt(value),
          max: config.speed.max * Math.sqrt(value)
        }
      })
    };
  }
}

// Export a singleton instance
export const streamPattern = new StreamPattern(); 