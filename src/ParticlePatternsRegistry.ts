import { ParticleEffectConfig } from './types';

export type ParticlePatternFunction = (overrides?: Partial<ParticleEffectConfig>) => ParticleEffectConfig;

const defaultExplosionPattern: ParticlePatternFunction = (overrides = {}) => {
  const config: ParticleEffectConfig = {
    particleCount: 50,
    model: "models/particle_rock.gltf",
    usePhysics: true,
    gravity: true,
    lifetime: 3,
    speed: { min: 5, max: 10 },
    direction: null,
    spread: 360,
    size: 0.2
  };
  return { ...config, ...overrides };
};

const defaultBurstPattern: ParticlePatternFunction = (overrides = {}) => {
  const config: ParticleEffectConfig = {
    particleCount: 15,
    model: "models/particle_smoke.gltf",
    usePhysics: false,
    gravity: false,
    lifetime: 1.5,
    speed: { min: 1, max: 2 },
    direction: { x: 0, y: 1, z: 0 },
    spread: 45,
    size: 0.5
  };
  return { ...config, ...overrides };
};

const defaultHitPattern: ParticlePatternFunction = (overrides = {}) => {
  const config: ParticleEffectConfig = {
    particleCount: 10,
    model: "models/particle_spark.gltf",
    usePhysics: false,
    gravity: false,
    lifetime: 0.5,
    speed: { min: 2, max: 4 },
    direction: null,
    spread: 60,
    size: 0.1
  };
  return { ...config, ...overrides };
};

export const ParticlePatternRegistry: { [name: string]: ParticlePatternFunction } = {
  explosion: defaultExplosionPattern,
  burst: defaultBurstPattern,
  hit: defaultHitPattern
};

export function registerParticlePattern(name: string, patternFunc: ParticlePatternFunction): void {
  if (ParticlePatternRegistry[name]) {
    console.warn(`Pattern "${name}" already exists and will be overwritten.`);
  }
  ParticlePatternRegistry[name] = patternFunc;
}

export function getParticlePattern(name: string): ParticlePatternFunction | undefined {
  return ParticlePatternRegistry[name];
} 