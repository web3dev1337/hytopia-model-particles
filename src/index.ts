export { Particle } from './Particle';
export { ParticleSystem } from './ParticleSystem';
export { Pattern } from './patterns/Pattern';
export { ExplosionPattern } from './patterns/ExplosionPattern';
export { StreamPattern } from './patterns/StreamPattern';
export { YAMLLoader } from './YAMLLoader';
export * from './types';

// Re-export Hytopia types that users might need
export { World, Entity, RigidBodyType, ColliderShape } from 'hytopia';
export type { Vector3Like } from 'hytopia';