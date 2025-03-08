import { startServer, World } from 'hytopia';
import { ParticleEmitter } from './ParticleEmitter';
import { ParticlePatternRegistry } from './ParticlePatternsRegistry';

export function initializeParticles() {
  startServer((world) => {
    const emitter = new ParticleEmitter(world);
    
    // Register default patterns
    ParticlePatternRegistry.registerDefaultPatterns();

    return {
      update: (deltaTime: number) => emitter.update(deltaTime),
      cleanup: () => emitter.cleanup()
    };
  });
} 