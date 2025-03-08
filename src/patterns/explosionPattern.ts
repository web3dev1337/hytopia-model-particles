import { ParticleEffectConfig } from '../types';

export function explosionPattern(overrides: Partial<ParticleEffectConfig> = {}): ParticleEffectConfig {
  const config: ParticleEffectConfig = {
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

  return { ...config, ...overrides };
} 