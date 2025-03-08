import { ParticleEffectConfig } from '../types';

export function hitPattern(overrides: Partial<ParticleEffectConfig> = {}): ParticleEffectConfig {
  const config: ParticleEffectConfig = {
    particleCount: 10,
    model: "models/particle_spark.gltf",
    usePhysics: false,
    gravity: false,
    lifetime: 0.5,
    speed: { min: 2, max: 4 },
    direction: null,  // Will be set based on hit direction
    spread: 60,      // Cone spread from hit point
    size: 0.1,
  };

  return { ...config, ...overrides };
} 