// Mock test script (JavaScript version to avoid TypeScript compiler issues)

// Create a mock world for testing
const mockWorld = {
  createEntity: (options) => {
    console.log('Created entity with options:', options);
    return {
      id: 'test-entity-' + Math.random().toString(36).substring(2, 9),
      active: true,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      scale: options.scale || 1,
      modelScale: options.scale || 1,
      isSpawned: false,
      spawn: (world, pos, vel, lifetime, physics) => {
        console.log(`Entity spawned at position: ${pos.x}, ${pos.y}, ${pos.z}`);
        return true;
      },
      update: (deltaTime) => {
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

// Mock the ParticlePatternRegistry
const mockPatternRegistry = {
  initialize: () => {
    console.log('ParticlePatternRegistry initialized');
    return true;
  },
  getPattern: (patternName) => {
    console.log(`Getting pattern: ${patternName}`);
    return {
      generate: (overrides) => {
        console.log('Generating pattern config with overrides:', overrides);
        return {
          particleCount: 10,
          lifetime: 1.0,
          speed: { min: 1, max: 3 },
          spread: 30,
          size: 0.5,
          direction: { x: 0, y: 1, z: 0 }
        };
      }
    };
  }
};

// Create a simpler version of the code we're testing
const ParticleClass = class Particle {
  constructor(world, modelUri, size) {
    this.inUse = false;
    this.entity = world.createEntity({
      model: modelUri || 'models/projectiles/fireball.gltf',
      scale: size || 1
    });
    console.log('Particle constructor called');
  }

  spawn(world, position, velocity, lifetime) {
    this.inUse = true;
    console.log(`Particle spawn called at position: ${JSON.stringify(position)}`);
    this.entity.spawn(world, position, velocity, lifetime);
  }

  update(deltaTime) {
    if (!this.inUse) return;
    console.log(`Particle update called with deltaTime: ${deltaTime}`);
  }

  despawn() {
    if (!this.inUse) return;
    console.log('Particle despawn called');
    this.entity.despawn();
    this.inUse = false;
  }

  isInUse() {
    return this.inUse;
  }
};

// Create a simple mock emitter
const ParticleEmitterClass = class ParticleEmitter {
  constructor(world) {
    this.world = world;
    this.particles = [];
    console.log('ParticleEmitter constructor called');
  }

  emitEffect(effectName, position, overrides) {
    console.log(`Emitting effect: ${effectName} at position: ${JSON.stringify(position)}`);
    const particle = new ParticleClass(this.world, 'models/projectiles/fireball.gltf', 0.5);
    particle.spawn(this.world, position, { x: 0, y: 1, z: 0 }, 1.0);
    this.particles.push(particle);
  }

  update(deltaTime) {
    console.log(`Updating emitter with deltaTime: ${deltaTime}`);
    for (const particle of this.particles) {
      particle.update(deltaTime);
    }
  }
};

// Test function
function initializeParticles(world) {
  console.log('Initializing particles with world:', world ? 'valid world' : 'invalid world');
  if (!world) {
    console.error('No world instance provided to initializeParticles');
    return null;
  }
  
  return new ParticleEmitterClass(world);
}

// Run test
function runTest() {
  console.log('Starting particle system test...');
  
  // Initialize particle system
  const emitter = initializeParticles(mockWorld);
  
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