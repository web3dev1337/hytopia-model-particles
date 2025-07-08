// Core exports
export { Particle } from './Particle';
export { ParticleSystem } from './ParticleSystem';

// Pattern exports
export { Pattern } from './patterns/Pattern';
export { ExplosionPattern } from './patterns/ExplosionPattern';
export { StreamPattern } from './patterns/StreamPattern';
export { SpiralPattern } from './patterns/SpiralPattern';
export { WavePattern } from './patterns/WavePattern';
export { RingPattern } from './patterns/RingPattern';
export { FountainPattern } from './patterns/FountainPattern';

// Animation system exports
export { AnimationSystem } from './animation/AnimationSystem';

// Performance monitoring exports
export { PerformanceMonitor } from './performance/PerformanceMonitor';

// Configuration exports
export { YAMLLoader } from './YAMLLoader';
export { EnhancedYAMLLoader } from './config/EnhancedYAMLLoader';

// Registry exports
export { PatternRegistry, CompositePattern } from './registry/PatternRegistry';

// Queue exports
export { EffectQueue } from './queue/EffectQueue';

// Type exports
export * from './types';

// Re-export Hytopia types that users might need
export { World, Entity, RigidBodyType, ColliderShape } from 'hytopia';
export type { Vector3Like } from 'hytopia';