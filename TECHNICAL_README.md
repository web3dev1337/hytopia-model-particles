# Hytopia Model Particles - Technical Documentation

## Architecture Overview

The particle system is built with performance and flexibility in mind, utilizing several key components:

### Core Components

1. **ParticleEmitter** (`ParticleEmitter.ts`)
   - Main interface for particle system control
   - Manages particle creation and lifecycle
   - Handles pattern application and modifications
   - Size: ~10KB, 322 lines

2. **ParticlePool** (`ParticlePool.ts`)
   - Efficient particle object pooling
   - Reduces garbage collection overhead
   - Manages particle recycling
   - Size: ~7KB, 237 lines

3. **ParticleDataBuffer** (`ParticleDataBuffer.ts`)
   - Optimized data storage for particle properties
   - Efficient memory management
   - Size: ~6KB, 185 lines

4. **ParticleLifecycleManager** (`ParticleLifecycleManager.ts`)
   - Handles particle creation, updates, and destruction
   - Manages particle state transitions
   - Size: ~6KB, 211 lines

### Physics and Spatial Management

1. **PhysicsController** (`PhysicsController.ts`)
   - Manages particle physics simulation
   - Handles collisions and forces
   - Size: ~5KB, 154 lines

2. **SpatialGrid** (`SpatialGrid.ts`)
   - Spatial partitioning for efficient collision detection
   - Optimizes particle interactions
   - Size: ~4KB, 149 lines

### Pattern System

1. **ParticlePatternsRegistry** (`ParticlePatternsRegistry.ts`)
   - Central registry for particle effect patterns
   - Pattern management and retrieval
   - Size: ~1.4KB, 42 lines

2. **ParticleConfigLoader** (`ParticleConfigLoader.ts`)
   - YAML/JSON configuration loading
   - Pattern validation and processing
   - Size: ~2KB, 59 lines

## Technical Specifications

### Performance Optimizations

1. **Memory Management**
   - Object pooling for particle instances
   - Typed arrays for particle data storage
   - Efficient garbage collection

2. **Spatial Optimization**
   - Grid-based spatial partitioning
   - Adaptive particle count based on performance
   - Culling of off-screen particles

3. **Physics Optimization**
   - Lightweight physics mode for non-colliding particles
   - Batch physics updates
   - Configurable update frequencies

### Type System

The system uses TypeScript with strict type checking. Key types are defined in `types.ts`:
- ParticleConfig
- PatternConfig
- EmitterOptions
- PhysicsOptions

### Build System

- TypeScript compilation with `tsconfig.json`
- NPM scripts for building, testing, and linting
- Jest for unit testing
- ESLint for code quality

## Integration Points

### Hytopia SDK Integration

The plugin integrates with the Hytopia SDK through:
- World object interaction
- Model loading system
- Physics engine integration
- Rendering pipeline

### Extension Points

1. **Custom Patterns**
   - Extend the `Pattern` class
   - Register via `ParticlePatternsRegistry`
   - Implement custom modifiers

2. **Custom Physics**
   - Override `PhysicsController` methods
   - Implement custom collision responses
   - Add custom forces

## Performance Guidelines

1. **Particle Count**
   - Recommended max: 1000 particles
   - Optimal range: 100-500 particles
   - Use adaptive performance scaling

2. **Update Frequency**
   - Physics: 60 Hz
   - Visual updates: Monitor refresh rate
   - Particle creation: Batch processing

3. **Memory Usage**
   - ~100 bytes per particle
   - Pool size: 2x max particles
   - Automatic memory management

## Dependencies

- hytopia (SDK): Latest from github:hytopiagg/sdk#main
- js-yaml: ^4.1.0
- TypeScript: ^5.3.3
- Various dev dependencies for testing and building

## Build and Test

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Lint code
npm run lint
``` 