import { ParticleEffectConfig } from '../types';

export function burstPattern(overrides: Partial<ParticleEffectConfig> = {}): ParticleEffectConfig {
  const config: ParticleEffectConfig = {
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

  return { ...config, ...overrides };
} 