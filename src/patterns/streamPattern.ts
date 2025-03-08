import { ParticleEffectConfig } from '../types';
import { Pattern } from './basePattern';

export class StreamPattern extends Pattern {
  name = 'stream';
  description = 'A flowing stream of particles in one direction - perfect for magic, fountains, beams, or any directional flow';
  defaultConfig: ParticleEffectConfig = {
    particleCount: 15,
    model: "models/particle_smoke.gltf",
    usePhysics: false,
    gravity: false,
    lifetime: 1.5,
    speed: { min: 1, max: 2 },
    direction: { x: 0, y: 1, z: 0 },  // Default upward
    spread: 45,                        // Cone spread
    size: 0.5,
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