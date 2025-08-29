// Core exports
export { Particle } from './core/Particle';
export { ParticleSystemV1 } from './ParticleSystemV1';
export { ParticleSystemV2 } from './ParticleSystemV2';
export { ParticleSystemV2 as ParticleSystem } from './ParticleSystemV2'; // Default to v2

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

// v2.2 exports - Optimization & Physics
export { ParticlePool } from './core/ParticlePool';
export { PhysicsForces } from './physics/PhysicsForces';
export { SpatialOptimizer } from './optimization/SpatialOptimizer';
export { ParticleDataBuffer, ParticleFlags } from './optimization/ParticleDataBuffer';

// Type exports
export * from './types';

// Re-export Hytopia types that users might need
export { World, Entity, RigidBodyType, ColliderShape } from 'hytopia';
export type { Vector3Like } from 'hytopia';