export { ParticleEmitter } from './ParticleEmitter';
export { registerParticlePattern } from './ParticlePatternsRegistry';
export type { ParticleEffectConfig, ParticleConfigFile, Vector3 } from './types';

// Re-export pattern functions for convenience
export { explosionPattern } from './patterns/explosionPattern';
export { burstPattern } from './patterns/burstPattern';
export { hitPattern } from './patterns/hitPattern'; 