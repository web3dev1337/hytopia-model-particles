import { ParticleEffectConfig } from '../types';
import { Pattern } from './basePattern';

export class ExplosionPattern extends Pattern {
  name = 'explosion';
  description = 'A spherical burst of particles with physics and gravity';
  defaultConfig: ParticleEffectConfig = {
    particleCount: 50,
    model: "models/particle_rock.gltf",
    usePhysics: true,
    gravity: true,
    lifetime: 3,
    speed: { min: 5, max: 10 },
    direction: null,  // Emit in all directions
    spread: 360,     // Full sphere emission
    size: 0.2,
  };

  constructor() {
    super();
    // Add explosion-specific modifiers
    this.modifiers = {
      ...this.modifiers,
      force: (config: ParticleEffectConfig, value: number) => ({
        ...config,
        speed: {
          min: config.speed.min * value,
          max: config.speed.max * value
        }
      }),
      debris: (config: ParticleEffectConfig, value: boolean) => ({
        ...config,
        usePhysics: value,
        gravity: value
      })
    };
  }
}

// Export a singleton instance
export const explosionPattern = new ExplosionPattern(); 