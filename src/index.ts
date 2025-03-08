// Main exports
export { initializeParticles } from '../plugin';
export { ParticleEmitter } from '../core/ParticleEmitter';
export { ParticlePatternRegistry } from '../patterns/ParticlePatternsRegistry';
export * from '../types';

// Pattern exports
export { explosionPattern } from './patterns/explosionPattern';
export { sparkPattern } from './patterns/sparkPattern';
export { streamPattern } from './patterns/streamPattern';

// Type exports for HYTOPIA SDK integration
export type { ParticleEffectConfig } from '../types'; 