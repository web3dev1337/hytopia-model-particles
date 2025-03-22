import { initializeParticles, ParticleEmitter } from './src/index';

// Mock for testing
const mockWorld = {
  createEntity: (options: any) => {
    console.log('Created entity with options:', options);
    return {
      id: 'test-entity-' + Math.random().toString(36).substr(2, 9),
      active: true,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      scale: options.scale || 1,
      modelScale: options.scale || 1,
      isSpawned: false,
      spawn: (world: any, pos: any, vel: any, lifetime: any, physics: any) => {
        console.log(`Entity spawned at position: ${pos.x}, ${pos.y}, ${pos.z}`);
        return true;
      },
      update: (deltaTime: number) => {
        console.log(`Entity updated with deltaTime: ${deltaTime}`);
        return true;
      },
      despawn: () => {
        console.log('Entity despawned');
        return true;
      }
    };
  }
};

// Test our fixes
function runTest() {
  console.log('Starting particle system test...');
  
  // Initialize particle system
  const emitter = initializeParticles(mockWorld as any);
  
  if (!emitter) {
    console.error('Failed to initialize particle system');
    return;
  }
  
  console.log('Particle system initialized successfully');
  
  // Emit an explosion effect
  emitter.emitEffect('explosion', { x: 0, y: 1, z: 0 });
  
  // Update the particle system to simulate a frame
  emitter.update(0.016); // ~60fps
  
  console.log('Test completed successfully');
}

runTest();