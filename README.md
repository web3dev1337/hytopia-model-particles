# Hytopia Model Particles

A particle system plugin for the Hytopia SDK that provides a flexible and performant way to create particle effects in your Hytopia games.

## Features

- Easy-to-use particle effect system
- Built-in patterns for common effects (explosion, burst, hit)
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
    
  gentleBurst:
    pattern: burst
    patternModifiers:
      intensity: 0.5
      spread: 30
      direction: { x: 0, y: 1, z: 0 }

  criticalHit:
    pattern: hit
    patternModifiers:
      impact: 2.0
      sparkle: true
      scale: 1.5
```

### Custom Patterns

You can create custom particle patterns by extending the Pattern class:

```typescript
import { Pattern, ParticlePatternRegistry, type ParticleEffectConfig } from 'hytopia-model-particles';

class FountainPattern extends Pattern {
  name = 'fountain';
  description = 'A continuous stream of particles shooting upward';
  defaultConfig: ParticleEffectConfig = {
    particleCount: 5,
    model: "models/particle_water.gltf",
    usePhysics: true,
    gravity: true,
    lifetime: 2,
    speed: { min: 8, max: 10 },
    direction: { x: 0, y: 1, z: 0 },
    spread: 15,
    size: 0.1,
  };

  constructor() {
    super();
    this.modifiers = {
      ...this.modifiers,
      height: (config: ParticleEffectConfig, value: number) => ({
        ...config,
        speed: {
          min: Math.sqrt(19.6 * value), // Calculate speed needed to reach height
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

### Pattern System

The pattern system allows for flexible and reusable particle effects:

```typescript
abstract class Pattern {
  abstract name: string;
  abstract description?: string;
  abstract defaultConfig: ParticleEffectConfig;
  
  // Common modifiers available to all patterns
  protected getDefaultModifiers() {
    return {
      intensity: (config, value) => { /* affects particle count and speed */ },
      scale: (config, value) => { /* affects particle size */ },
      duration: (config, value) => { /* affects particle lifetime */ }
    };
  }
}

class ParticlePatternRegistry {
  static registerPattern(pattern: Pattern): void;
  static getPattern(name: string): Pattern | undefined;
  static listPatterns(): { name: string; description?: string }[];
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
  patternModifiers?: {           // Optional modifiers for the pattern
    [key: string]: any;
  };
  color?: { r: number; g: number; b: number; a?: number }; // Optional color tint
  fadeOut?: boolean;             // Whether particles should fade out over lifetime
  rotationSpeed?: { min: number; max: number }; // Optional rotation speed range
  scaleOverTime?: {             // Optional scale modification over lifetime
    start: number;
    end: number;
  };
}
```

## Built-in Patterns and Modifiers

### Explosion Pattern
- Base: Spherical burst of particles with physics
- Modifiers:
  - `intensity`: Affects particle count and speed
  - `force`: Multiplies particle speed
  - `debris`: Toggles physics and gravity

### Burst Pattern
- Base: Directional burst, typically upward
- Modifiers:
  - `intensity`: Affects particle count and speed
  - `spread`: Controls cone angle (0-360)
  - `direction`: Sets emission direction

### Hit Pattern
- Base: Quick spark effect for impacts
- Modifiers:
  - `intensity`: Affects particle count and speed
  - `impact`: Affects force and particle count
  - `sparkle`: Adds rotation and fade effects

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 