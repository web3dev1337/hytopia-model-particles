// Main exports
export { initializeParticles, getEmitterInstance, initializeParticleServer } from './plugin';
export { ParticleEmitter } from './core/ParticleEmitter';
export { ParticlePatternRegistry } from './patterns/ParticlePatternsRegistry';
export { Particle } from './core/Particle';
export * from './types';

// Pattern exports
export { explosionPattern } from './patterns/built-in/explosionPattern';
export { sparkPattern } from './patterns/built-in/sparkPattern';
export { streamPattern } from './patterns/built-in/streamPattern';

// Type exports for HYTOPIA SDK integration
export type { ParticleEffectConfig } from './types';