# Hytopia Model Particles

A particle system plugin for the Hytopia SDK that provides a flexible and performant way to create particle effects in your Hytopia games.

## Features

- Easy-to-use particle effect system
- Built-in patterns for common effects (explosion, burst, hit)
- Configurable via YAML or JSON
- Performance optimization with adaptive particle counts
- Physics-enabled and lightweight particle modes
- Extensible pattern system

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
  explosion:
    pattern: explosion
    particleCount: 60
    model: "models/explosion_debris.gltf"
    size: 0.3

  hit:
    pattern: hit
    model: "models/hit_spark.gltf"
    speed:
      min: 3
      max: 5
```

### Custom Patterns

You can create and register custom particle patterns:

```typescript
import { registerParticlePattern, type ParticleEffectConfig } from 'hytopia-model-particles';

function customPattern(overrides: Partial<ParticleEffectConfig> = {}): ParticleEffectConfig {
  const config: ParticleEffectConfig = {
    particleCount: 20,
    model: "models/custom.gltf",
    usePhysics: true,
    gravity: true,
    lifetime: 2,
    speed: { min: 2, max: 5 },
    direction: { x: 0, y: 1, z: 0 },
    spread: 45,
    size: 0.3,
  };
  return { ...config, ...overrides };
}

// Register the pattern
registerParticlePattern('custom', customPattern);

// Use the custom pattern
emitter.emitEffect('custom', position);
```

## API Reference

### ParticleEmitter

The main class for managing particle effects.

```typescript
class ParticleEmitter {
  constructor(world: World, config?: string | ParticleConfigFile);
  static fromYaml(configFilePath: string, world: World): ParticleEmitter;
  emitEffect(effectName: string, position: Vector3, overrides?: Partial<ParticleEffectConfig>): void;
  update(deltaTime: number): void;
}
```

### ParticleEffectConfig

Configuration interface for particle effects.

```typescript
interface ParticleEffectConfig {
  particleCount: number;           // Number of particles per effect
  model?: string;                  // Model URI (e.g., a .gltf file)
  usePhysics?: boolean;           // Whether physics is enabled
  gravity?: boolean;              // Whether gravity applies
  lifetime: number;               // Lifetime in seconds
  speed: { min: number; max: number }; // Speed range
  direction?: { x: number; y: number; z: number } | null;
  spread: number;                 // Spread angle in degrees
  size: number;                   // Scale of the particle
  pattern?: string;               // Optional pattern reference
}
```

## Built-in Patterns

- `explosion`: Simulates an explosion with physics-enabled debris
- `burst`: Creates an upward burst of particles
- `hit`: Generates a quick spark effect for impacts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 