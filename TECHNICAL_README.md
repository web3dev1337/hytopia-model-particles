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

## Component Details

### Queue and Lifecycle Management

1. **ParticleEffectQueue** (`ParticleEffectQueue.ts`)
   - Manages effect scheduling and execution
   - Handles effect priorities and timing
   - Prevents effect overlap and conflicts
   - Size: ~4.9KB, 169 lines

2. **ParticleLifecycleManager** (`ParticleLifecycleManager.ts`)
   - Controls particle state transitions
   - Manages particle spawning and despawning
   - Handles cleanup and memory management
   - Size: ~6.3KB, 211 lines

### Data Management

1. **ParticleDataBuffer** (`ParticleDataBuffer.ts`)
   - Efficient typed array storage
   - SIMD-friendly data layout
   - Handles particle property updates
   - Size: ~5.9KB, 185 lines

2. **Particle** (`Particle.ts`)
   - Base particle entity implementation
   - Property management and updates
   - Integration with physics system
   - Size: ~1.5KB, 50 lines

### Built-in Patterns

Located in `src/patterns/`:

1. **BasePattern** (`basePattern.ts`)
   - Abstract pattern implementation
   - Common modifier handling
   - Default configuration management
   - Size: ~1.7KB, 54 lines

2. **ExplosionPattern** (`explosionPattern.ts`)
   ```typescript
   // Example configuration
   {
     particleCount: 30,
     speed: { min: 10, max: 15 },
     spread: 360,
     lifetime: { min: 0.5, max: 1.5 },
     physics: {
       enabled: true,
       rigidBody: {
         useGravity: true,
         gravityScale: 1.0
       }
     }
   }
   ```
   - Radial burst emission
   - Physics-based debris
   - Size: ~1.6KB, 63 lines

3. **StreamPattern** (`streamPattern.ts`)
   ```typescript
   // Example configuration
   {
     particleCount: 20,
     speed: { min: 5, max: 8 },
     spread: 15,
     lifetime: 2.0,
     direction: { x: 0, y: 1, z: 0 },
     continuous: true
   }
   ```
   - Continuous particle emission
   - Directional control
   - Size: ~1.3KB, 46 lines

4. **SparkPattern** (`sparkPattern.ts`)
   ```typescript
   // Example configuration
   {
     particleCount: 10,
     speed: { min: 8, max: 12 },
     spread: 180,
     lifetime: 0.3,
     fadeOut: true,
     scaleOverTime: {
       start: 1.0,
       end: 0.0
     }
   }
   ```
   - Quick visual effects
   - Fade and scale animations
   - Size: ~1.2KB, 45 lines

### Utility Components

1. **Utils** (`utils.ts`)
   - Math helper functions
   - Vector operations
   - Random number generation
   - Performance monitoring
   - Size: ~2.0KB, 66 lines

2. **Plugin System** (`plugin.ts`)
   - Hytopia SDK integration
   - Plugin lifecycle management
   - Event handling
   - Size: ~526B, 17 lines

## Implementation Details

### Memory Management

1. **Particle Pool**
   ```typescript
   // Pool initialization
   const pool = new ParticlePool({
     initialSize: 1000,
     growthFactor: 1.5,
     maxSize: 5000
   });

   // Particle acquisition
   const particle = pool.acquire();
   if (particle) {
     particle.init(config);
   }

   // Particle release
   pool.release(particle);
   ```

2. **Data Buffer Management**
   ```typescript
   // Buffer creation
   const buffer = new ParticleDataBuffer(1000);

   // Property updates
   buffer.updatePosition(index, x, y, z);
   buffer.updateVelocity(index, vx, vy, vz);
   buffer.updateLifetime(index, time);
   ```

### Physics Integration

1. **Collision System**
   ```typescript
   // Collision configuration
   const physicsConfig = {
     rigidBody: {
       type: 'dynamic',
       colliders: [{
         shape: 'sphere',
         size: { x: 1, y: 1, z: 1 },
         material: {
           restitution: 0.5,
           friction: 0.3
         }
       }]
     }
   };
   ```

2. **Force Application**
   ```typescript
   // Apply forces
   particle.applyForce(force);
   particle.applyTorque(torque);
   particle.applyImpulse(impulse, point);
   ```

### Performance Monitoring

```typescript
// Performance metrics
interface PerformanceMetrics {
  lastFrameTime: number;
  frameCount: number;
  averageFrameTime: number;
  particleReductionFactor: number;
  activeParticleCount: number;
  poolSize: number;
  fpsHistory: number[];
  droppedFrames: number;
}

// Monitor usage
const metrics = emitter.getPerformanceMetrics();
if (metrics.averageFrameTime > 16.67) { // >60fps
  emitter.enableAdaptivePerformance();
}
```

## Build and Development

### Project Structure
```
src/
├── patterns/
│   ├── basePattern.ts
│   ├── explosionPattern.ts
│   ├── sparkPattern.ts
│   └── streamPattern.ts
├── core/
│   ├── Particle.ts
│   ├── ParticleEmitter.ts
│   └── ParticlePool.ts
├── physics/
│   ├── PhysicsController.ts
│   └── SpatialGrid.ts
└── utils/
    ├── ParticleDataBuffer.ts
    └── utils.ts
```

### Development Workflow

1. **Building**
   ```bash
   # Development build with watch mode
   npm run build:watch

   # Production build
   npm run build:prod
   ```

2. **Testing**
   ```bash
   # Run unit tests
   npm test

   # Run tests with coverage
   npm run test:coverage
   ```

3. **Code Quality**
   ```bash
   # Lint code
   npm run lint

   # Fix linting issues
   npm run lint:fix
   ``` 