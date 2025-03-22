import { startServer, World as HytopiaWorld } from 'hytopia';
import { ParticleEmitter } from './core/ParticleEmitter';
import { ParticlePatternRegistry } from './patterns/ParticlePatternsRegistry';
import { World } from './types';

let emitterInstance: ParticleEmitter | null = null;

export function initializeParticles(world?: HytopiaWorld, debug: boolean = true): ParticleEmitter | null {
  try {
    console.log('Initializing particle system with enhanced visibility tracking...');
    
    // Initialize the pattern registry first
    ParticlePatternRegistry.initialize();
    console.log('ParticlePatternRegistry initialized successfully');
    
    // Check if we have a world instance
    if (!world) {
      console.error('No world instance provided to initializeParticles');
      return null;
    }
    
    // Create the emitter after patterns are registered
    // Cast the HytopiaWorld to our internal World type to satisfy TypeScript
    emitterInstance = new ParticleEmitter(world as unknown as World);
    console.log('ParticleEmitter initialized successfully');
    
    // Log available patterns for debugging
    const patterns = ParticlePatternRegistry.getPatternNames();
    console.log(`Available particle patterns (${patterns.length}): ${patterns.join(', ')}`);
    
    // Always setup update interval to ensure particle system is properly updated
    const updateIntervalId = setInterval(() => {
      if (emitterInstance) {
        emitterInstance.update(1/60); // Update with roughly 60fps timing
      } else {
        // If emitter is gone, clear the interval
        clearInterval(updateIntervalId);
      }
    }, 1000/60); // 60 times per second
    
    if (debug) {
      // Setup a simple particle test after a short delay
      setTimeout(() => {
        try {
          if (emitterInstance) {
            console.log('Running particle system test...');
            
            // Test at center of the world (likely origin) at eye height
            emitterInstance.emitEffect('explosion', { x: 0, y: 2, z: 0 });
            console.log('Test explosion emitted at (0, 2, 0)');
            
            // Test a second pattern for more visibility
            setTimeout(() => {
              if (emitterInstance) {
                emitterInstance.emitEffect('stream', { x: 0, y: 2, z: 0 });
                console.log('Test stream emitted at (0, 2, 0)');
              }
            }, 2000);
            
            // Test a third pattern for comprehensive testing
            setTimeout(() => {
              if (emitterInstance) {
                emitterInstance.emitEffect('spark', { x: 0, y: 2, z: 0 });
                console.log('Test spark emitted at (0, 2, 0)');
              }
            }, 4000);
          }
        } catch (e) {
          console.error('Error running particle test:', e);
        }
      }, 2000);
    }
    
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
  startServer((world: HytopiaWorld) => {
    // Initialize the pattern registry first
    ParticlePatternRegistry.initialize();
    console.log('ParticlePatternRegistry initialized successfully');
    
    // Create the emitter after patterns are registered - cast to satisfy TypeScript
    const emitter = new ParticleEmitter(world as unknown as World);
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