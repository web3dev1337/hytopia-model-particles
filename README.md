# Hytopia Model Particles

A particle system plugin for the Hytopia SDK that provides a flexible and performant way to create particle effects in your Hytopia games.

## Features

- Easy-to-use particle effect system
- Built-in patterns for common effects (explosion, stream, spark)
- Configurable via YAML or JSON
- Performance optimization with adaptive particle counts
- Physics-enabled and lightweight particle modes
- Extensible pattern system with modifiers

## Installation

```bash
npm install hytopia-model-particles
```

Note: This package requires `@hytopia/sdk` as a peer dependency.

## Usage

### Basic Usage

```typescript
import { ParticleEmitter } from 'hytopia-model-particles';
import type { World, Vector3 } from '@hytopia/sdk';

// Initialize with default configuration
const emitter = new ParticleEmitter(world);

// Emit an effect
emitter.emitEffect('explosion', { x: 0, y: 1, z: 0 });

// Emit with modifiers
emitter.emitEffect('explosion', { x: 0, y: 1, z: 0 }, {
  patternModifiers: {
    intensity: 2.0,  // Double the intensity
    force: 1.5      // 50% more force
  }
});

// Update in your game loop
function gameLoop(deltaTime: number) {
  emitter.update(deltaTime);
}
```

### Using Configuration File

```typescript
// Load from YAML config
const emitter = ParticleEmitter.fromYaml('./config/particles.yml', world);
```

Example YAML configuration:

```yaml
global:
  adaptivePerformance: true
  maxParticles: 500

effects:
  bigExplosion:
    pattern: explosion
    patternModifiers:
      intensity: 2.0
      force: 1.5
      debris: true
    
  gentleStream:
    pattern: stream
    patternModifiers:
      intensity: 0.5
      spread: 15
      direction: { x: 0, y: 1, z: 0 }

  criticalHit:
    pattern: spark
    patternModifiers:
      impact: 2.0
      sparkle: true
```

### Custom Patterns

You can create custom particle patterns by extending the Pattern class:

```typescript
import { Pattern, ParticlePatternRegistry } from 'hytopia-model-particles';

class FountainPattern extends Pattern {
  name = 'fountain';
  description = 'A continuous stream of particles shooting upward';
  defaultConfig: ParticleEffectConfig = {
    particleCount: 5,
    model: "models/particle_water.gltf",
    physics: {
      enabled: true,
      rigidBody: {
        type: 'dynamic',
        useGravity: true,
        gravityScale: 1,
        material: {
          restitution: 0.3,
          friction: 0.8,
          density: 1.0
        }
      }
    },
    lifetime: 2,
    speed: { min: 8, max: 10 },
    direction: { x: 0, y: 1, z: 0 },
    spread: 15,
    size: 0.1,
  };

  constructor() {
    super();
    // Add fountain-specific modifiers
    this.modifiers = {
      ...this.modifiers,  // Includes default modifiers (intensity, scale, duration)
      height: (config: ParticleEffectConfig, value: number) => ({
        ...config,
        speed: {
          min: Math.sqrt(19.6 * value),  // Calculate speed needed to reach height
          max: Math.sqrt(19.6 * value) * 1.2
        }
      })
    };
  }
}

// Register the pattern
ParticlePatternRegistry.registerPattern(new FountainPattern());

// Use the custom pattern
emitter.emitEffect('fountain', position, {
  patternModifiers: {
    height: 5,  // Fountain reaches 5 units high
    intensity: 1.5  // 50% more particles
  }
});
```

## Built-in Patterns

### Explosion Pattern
- Base: Spherical burst of particles with physics
- Modifiers:
  - `intensity`: Affects particle count and speed
  - `force`: Multiplies particle speed
  - `debris`: Toggles physics and gravity

### Stream Pattern
- Base: Continuous stream of particles in a direction
- Modifiers:
  - `intensity`: Affects particle count and speed
  - `spread`: Controls cone angle (0-360)
  - `direction`: Sets emission direction

### Spark Pattern
- Base: Quick spark effect for impacts
- Modifiers:
  - `intensity`: Affects particle count and speed
  - `impact`: Affects force and particle count
  - `sparkle`: Adds rotation and fade effects

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 