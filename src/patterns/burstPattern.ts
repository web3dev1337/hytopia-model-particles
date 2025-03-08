import { ParticleEffectConfig } from '../types';
import { Pattern } from './basePattern';

export class BurstPattern extends Pattern {
  name = 'burst';
  description = 'A directional burst of particles, typically upward';
  defaultConfig: ParticleEffectConfig = {
    particleCount: 15,
    model: "models/particle_smoke.gltf",
    usePhysics: false,
    gravity: false,
    lifetime: 1.5,
    speed: { min: 1, max: 2 },
    direction: { x: 0, y: 1, z: 0 },  // Upward direction
    spread: 45,                        // Cone spread
    size: 0.5,
  };

  constructor() {
    super();
    // Add burst-specific modifiers
    this.modifiers = {
      ...this.modifiers,
      spread: (config: ParticleEffectConfig, value: number) => ({
        ...config,
        spread: Math.max(0, Math.min(360, value))
      }),
      direction: (config: ParticleEffectConfig, value: { x: number; y: number; z: number }) => ({
        ...config,
        direction: value
      })
    };
  }
}

// Export a singleton instance
export const burstPattern = new BurstPattern(); 