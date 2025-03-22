import { startServer, World } from 'hytopia';
import { ParticleEmitter } from './core/ParticleEmitter';
import { ParticlePatternRegistry } from './patterns/ParticlePatternsRegistry';

let emitterInstance: ParticleEmitter | null = null;

export function initializeParticles(world?: World): ParticleEmitter | null {
  try {
    // Initialize the pattern registry first
    ParticlePatternRegistry.initialize();
    console.log('ParticlePatternRegistry initialized successfully');
    
    // Check if we have a world instance
    if (!world) {
      console.error('No world instance provided to initializeParticles');
      return null;
    }
    
    // Create the emitter after patterns are registered
    emitterInstance = new ParticleEmitter(world);
    console.log('ParticleEmitter initialized successfully');
    
    return emitterInstance;
  } catch (e) {
    console.error('Error initializing particle system:', e);
    return null;
  }
}

export function getEmitterInstance(): ParticleEmitter | null {
  return emitterInstance;
}

// Legacy server initialization function - prefer using direct initialization instead
export function initializeParticleServer() {
  startServer((world) => {
    // Initialize the pattern registry first
    ParticlePatternRegistry.initialize();
    console.log('ParticlePatternRegistry initialized successfully');
    
    // Create the emitter after patterns are registered
    const emitter = new ParticleEmitter(world);
    emitterInstance = emitter;
    console.log('ParticleEmitter initialized successfully through server');

    return {
      update: (deltaTime: number) => {
        if (emitter) {
          emitter.update(deltaTime);
        }
      },
      cleanup: () => {
        if (emitter) {
          emitter.cleanup();
          emitterInstance = null;
        }
      }
    };
  });
}

export { ParticleEmitter, ParticlePatternRegistry };