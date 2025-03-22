import { startServer, World } from 'hytopia';
import { ParticleEmitter } from './core/ParticleEmitter';
import { ParticlePatternRegistry } from './patterns/ParticlePatternsRegistry';

export function initializeParticles() {
  startServer((world) => {
    // Initialize the pattern registry first
    ParticlePatternRegistry.initialize();
    
    // Create the emitter after patterns are registered
    const emitter = new ParticleEmitter(world);

    return {
      update: (deltaTime: number) => emitter.update(deltaTime),
      cleanup: () => emitter.cleanup()
    };
  });
} 