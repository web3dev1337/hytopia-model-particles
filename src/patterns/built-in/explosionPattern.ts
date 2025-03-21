import { ParticleEffectConfig } from '../../types';
import { Pattern } from '../base/basePattern';

export class ExplosionPattern extends Pattern {
  name = 'explosion';
  description = 'A spherical burst of particles with physics and gravity';
  defaultConfig: ParticleEffectConfig = {
    particleCount: 50,
    model: "models/projectiles/fireball.gltf",
    physics: {
      enabled: true,
      rigidBody: {
        type: 'dynamic',
        useGravity: true,
        gravityScale: 1,
        material: {
          restitution: 0.3,
          friction: 0.8,
          density: 1.0
        }
      }
    },
    lifetime: 30,
    speed: { min: 1, max: 2 },
    direction: null,  // Emit in all directions
    spread: 360,     // Full sphere emission
    size: 20.0,
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
        physics: {
          ...config.physics,
          enabled: value,
          rigidBody: value ? {
            type: 'dynamic',
            useGravity: value,
            material: {
              restitution: 0.3,
              friction: 0.8,
              density: 1.0
            }
          } : undefined
        }
      })
    };
  }
}

// Export a singleton instance
export const explosionPattern = new ExplosionPattern(); 