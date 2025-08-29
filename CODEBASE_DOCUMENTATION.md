# Hytopia Model Particles Codebase Documentation

## Quick Navigation
ENTRY:    src/index.ts - Library entry point
CORE:     src/core/*.ts - Core particle system
SYSTEM:   src/ParticleSystemV2.ts - Main v2 implementation  
PATTERNS: src/patterns/*.ts - Effect patterns
PHYSICS:  src/physics/*.ts - Physics forces
CONFIG:   config/particles.yml - System configuration
TESTS:    examples/v2.1-showcase.ts - Testing showcase

## Core Systems

### Particle Entity (v2.3 with Pooling)
src/core/Particle.ts - Core particle entity class
├─ Manages: Individual particle lifecycle with pooling
├─ Methods: activate(), reset(), park(), update()
├─ Pattern: Object pooling with physics integration
└─ Key Features:
   - True entity reuse (no destroy/create)
   - Physics enable/disable on park/activate
   - Velocity and force management
   - Color and transparency animations

### Particle Pool
src/core/ParticlePool.ts - Entity pool management
├─ Manages: Pre-created particle entity pool
├─ Methods: getParticle(), returnParticle(), buildPool()
├─ Pattern: Object pool with gradual building
└─ Configuration: maxPoolSize (default 200)

### Particle System V2
src/ParticleSystemV2.ts - Main system orchestrator
├─ Manages: All particles, patterns, and effects
├─ Methods: spawnParticles(), createEffect(), update()
├─ Integrations: Pool, patterns, physics, monitoring
└─ Features:
   - Effect queue management
   - Pattern-based spawning
   - Performance monitoring
   - YAML configuration support

## Pattern System

### Base Pattern
src/patterns/Pattern.ts - Abstract pattern interface
├─ Interface for all particle patterns
└─ Methods: generate(), calculateVelocity()

### Pattern Implementations
src/patterns/ExplosionPattern.ts - Radial explosion effect
├─ Spherical/hemispherical bursts
└─ Configurable spread and force

src/patterns/FountainPattern.ts - Upward fountain spray
├─ Gravity-affected upward stream
└─ Spread and height control

src/patterns/SpiralPattern.ts - Spiral motion patterns
├─ Rotating spiral trajectories
└─ Configurable radius and speed

src/patterns/StreamPattern.ts - Directional streams
src/patterns/WavePattern.ts - Wave-like motion
src/patterns/RingPattern.ts - Ring/circle patterns

### Pattern Registry
src/registry/PatternRegistry.ts - Pattern factory
├─ Manages: Pattern registration and creation
└─ Singleton pattern implementation

## Physics System

### Physics Forces
src/physics/PhysicsForces.ts - Force calculations
├─ Manages: Gravity, drag, wind forces
├─ Methods: applyGravity(), applyDrag(), applyWind()
└─ Integration with Hytopia physics engine

## Optimization Systems

### Spatial Optimizer
src/optimization/SpatialOptimizer.ts - Spatial indexing
├─ Manages: Spatial partitioning for culling
├─ Methods: updateGrid(), getVisibleParticles()
└─ Grid-based optimization

### Data Buffer
src/optimization/ParticleDataBuffer.ts - Memory optimization
├─ Manages: Efficient data storage
├─ Uses TypedArrays for performance
└─ Batch updates support

### Performance Monitor
src/performance/PerformanceMonitor.ts - Metrics tracking
├─ Tracks: FPS, particle count, update times
├─ Methods: startFrame(), endFrame(), getMetrics()
└─ Real-time performance analysis

## Configuration

### YAML Loader
src/YAMLLoader.ts - Configuration parser
├─ Loads YAML effect definitions
└─ Validates configuration schema

### Enhanced YAML Loader
src/config/EnhancedYAMLLoader.ts - Advanced configs
├─ Extended YAML parsing capabilities
└─ Complex effect compositions

### Main Config
config/particles.yml - System configuration
├─ Default particle settings
├─ Pattern configurations
└─ Performance parameters

## Queue System

### Effect Queue
src/queue/EffectQueue.ts - Effect scheduling
├─ Manages: Timed effect spawning
├─ Methods: addEffect(), processQueue()
└─ Supports delayed and repeated effects

## Animation

### Animation System
src/animation/AnimationSystem.ts - Property animation
├─ Manages: Color, scale, rotation animations
├─ Easing functions support
└─ Keyframe interpolation

## Build Output

### Distribution Files
dist/index.js - Compiled JavaScript
dist/index.d.ts - TypeScript definitions
dist/types.d.ts - Type exports

## Workflow

### Setup
```bash
npm install          # Install dependencies
npm run build        # Build the library
```

### Development
```bash
npm run watch        # Watch mode
npm run example      # Test with showcase
```

### Testing
```bash
# Run the showcase example
npm run example

# Manually test specific patterns
# Edit examples/v2.1-showcase.ts
```

### Building
```bash
npm run build        # Compile TypeScript
npm run clean        # Clean dist folder
```

## Version History
- v2.3.0: True entity pooling implementation
- v2.2.0: Object pooling and optimizations
- v2.1.0: Pattern system and YAML support
- v2.0.0: Complete rewrite with physics
- v1.0.0: Initial implementation