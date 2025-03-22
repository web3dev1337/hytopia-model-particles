import { World } from 'hytopia';
import { ParticleEmitter } from './core/ParticleEmitter';
import { ParticlePatternRegistry } from './patterns/ParticlePatternsRegistry';
export declare function initializeParticles(world?: World, debug?: boolean): ParticleEmitter | null;
export declare function getEmitterInstance(): ParticleEmitter | null;
export declare function initializeParticleServer(): void;
export { ParticleEmitter, ParticlePatternRegistry };
