# Hytopia Model Particles

A powerful and flexible particle system plugin for the Hytopia SDK that brings life to your games with beautiful particle effects.

[Technical documentation available here](./TECHNICAL_README.md)

## ✨ Features

- 🎮 Easy-to-use particle effect system
- 🎨 Built-in patterns for common effects (explosion, stream, spark)
- ⚙️ Configure via YAML or JSON
- 🚀 High performance with smart optimizations
- 🎯 Physics-enabled particles with collision support
- 🔧 Extensible pattern system

## 📦 Installation

```bash
npm install hytopia-model-particles
```

**Requirements:**
- Node.js 14+
- Hytopia SDK (peer dependency)

## 🚀 Quick Start

### Basic Usage

```typescript
import { ParticleEmitter } from 'hytopia-model-particles';

// Initialize with your game world
const emitter = new ParticleEmitter(world);

// Create an explosion effect
emitter.emitEffect('explosion', { x: 0, y: 1, z: 0 });

// Create a continuous stream
emitter.emitEffect('stream', { x: 0, y: 0, z: 0 }, {
  patternModifiers: {
    direction: { x: 0, y: 1, z: 0 },
    spread: 15
  }
});

// Update in your game loop
function gameLoop(deltaTime: number) {
  emitter.update(deltaTime);
}
```

### Using Configuration Files

Create a `particles.yml` file:

```yaml
effects:
  magicSpell:
    pattern: spark
    patternModifiers:
      intensity: 1.5
      sparkle: true
      color: { r: 0.5, g: 0.1, b: 1.0 }
  
  waterfall:
    pattern: stream
    patternModifiers:
      direction: { x: 0, y: -1, z: 0 }
      spread: 10
      intensity: 0.8
```

Load and use your effects:

```typescript
const emitter = ParticleEmitter.fromYaml('./particles.yml', world);
emitter.emitEffect('magicSpell', playerPosition);
```

## 🎨 Built-in Effects

### 💥 Explosion
Perfect for impacts, explosions, and bursts.
```typescript
emitter.emitEffect('explosion', position, {
  patternModifiers: {
    intensity: 2.0,  // More particles
    force: 1.5,      // Faster particles
    debris: true     // Add physics-enabled debris
  }
});
```

### 🌊 Stream
Ideal for continuous effects like water, fire, or magic.
```typescript
emitter.emitEffect('stream', position, {
  patternModifiers: {
    flow: 0.5,
    spread: 15,
    direction: { x: 0, y: 1, z: 0 }
  }
});
```

### ✨ Spark
Great for impacts, highlights, and magical effects.
```typescript
emitter.emitEffect('spark', position, {
  patternModifiers: {
    impact: 2.0,   // Stronger effect
    sparkle: true  // Add twinkling
  }
});
```

## 🔧 Creating Custom Effects

1. Create your pattern class:
```typescript
import { Pattern, ParticlePatternRegistry } from 'hytopia-model-particles';

class RainPattern extends Pattern {
  name = 'rain';
  description = 'Creates a rainfall effect';
  
  defaultConfig = {
    particleCount: 100,
    model: "models/raindrop.gltf",
    lifetime: { min: 1, max: 2 },
    physics: {
      enabled: true,
      useGravity: true
    }
  };

  constructor() {
    super();
    this.modifiers = {
      intensity: (config, value) => ({
        ...config,
        particleCount: Math.floor(config.particleCount * value)
      }),
      area: (config, value) => ({
        ...config,
        physics: {
          ...config.physics,
          rigidBody: {
            ...config.physics?.rigidBody,
            colliders: [{
              shape: "box",
              size: { x: value, y: value, z: value }
            }]
          }
        }
      })
    };
  }
}
```

2. Register and use your pattern:
```typescript
ParticlePatternRegistry.registerPattern(new RainPattern());

emitter.emitEffect('rain', { x: 0, y: 10, z: 0 }, {
  patternModifiers: {
    intensity: 2.0,  // Heavy rain
    area: 20        // Large area
  }
});
```

## 🎮 Performance Tips

1. **Particle Count**: Keep particle counts reasonable
   - Light effects: 10-50 particles
   - Medium effects: 50-200 particles
   - Heavy effects: 200-500 particles

2. **Physics Usage**: Use physics selectively
   ```typescript
   emitter.emitEffect('debris', position, {
     physics: {
       enabled: true,      // Enable for important particles
       rigidBody: {
         useGravity: true,
         type: "dynamic"
       }
     }
   });
   ```

3. **Effect Cleanup**: Clean up effects when done
   ```typescript
   // Stop emitting new particles
   emitter.stopEffect('myEffect');
   
   // Clear all particles immediately
   emitter.clear();
   ```

## 📚 Additional Resources

- [Technical Documentation](./TECHNICAL_README.md)
- [API Reference](https://hytopia.dev/docs/particles) (external)
- [Examples Repository](https://github.com/hytopiagg/particle-examples)

## 🤝 Contributing

Contributions are welcome! Please check our [Contributing Guidelines](CONTRIBUTING.md).

## 📄 License

MIT License - feel free to use in your Hytopia games!

## 📝 Configuration Guide

### Global Configuration

You can set global options in your `particles.yml` or via code:

```yaml
global:
  adaptivePerformance: true    # Automatically adjust particle counts based on performance
  maxParticles: 1000          # Maximum particles across all effects
  poolOptions:
    cellSize: 5              # Size of spatial grid cells
    sleepDistance: 50        # Distance at which particles go to sleep
    cleanupCheckInterval: 1000  # Milliseconds between cleanup checks
    bounds:                  # World boundaries for particles
      min: { x: -1000, y: -1000, z: -1000 }
      max: { x: 1000, y: 1000, z: 1000 }
```

### Effect Configuration

Each effect can be configured with these parameters:

```yaml
effects:
  myEffect:
    particleCount: 100        # Number of particles to emit
    model: "models/particle.gltf"  # 3D model to use (optional)
    lifetime: 2              # Particle lifetime in seconds
    speed:
      min: 5                # Minimum initial speed
      max: 10               # Maximum initial speed
    direction:              # Emission direction (optional)
      x: 0
      y: 1
      z: 0
    spread: 15             # Spread angle in degrees
    size: 0.5              # Particle size/scale
    fadeOut: true          # Fade out over lifetime
    rotationSpeed:         # Rotation speed range (optional)
      min: 0
      max: 360
    scaleOverTime:         # Size change over lifetime (optional)
      start: 1.0
      end: 0.0
    color:                 # Particle color tint (optional)
      r: 1.0
      g: 0.5
      b: 0.0
      a: 1.0              # Alpha (optional)
    physics:              # Physics configuration (optional)
      rigidBody:
        type: "dynamic"    # dynamic, static, or kinematic
        mass: 1.0
        useGravity: true
        gravityScale: 1.0
        linearDamping: 0.1
        angularDamping: 0.1
        fixedRotation: false
        material:
          restitution: 0.5  # Bounciness (0-1)
          friction: 0.5     # Surface friction (0-1)
          density: 1.0      # Material density
        colliders:
          - shape: "sphere"  # sphere, box, or cylinder
            size: { x: 1, y: 1, z: 1 }  # or radius for sphere
            offset: { x: 0, y: 0, z: 0 }
            isTrigger: false
      forces:              # Optional forces
        wind:
          direction: { x: 1, y: 0, z: 0 }
          strength: 10
          turbulence: 0.5
        vortex:
          center: { x: 0, y: 0, z: 0 }
          strength: 5
          radius: 10
```

### Pattern System

Patterns provide default configurations that can be overridden. Here's how to create and use patterns:

```typescript
// Define a pattern
class FirePattern extends Pattern {
  name = 'fire';
  description = 'A realistic fire effect';
  
  defaultConfig = {
    particleCount: 50,
    lifetime: 1.5,
    speed: { min: 2, max: 4 },
    direction: { x: 0, y: 1, z: 0 },
    spread: 25,
    size: 0.3,
    fadeOut: true,
    color: { r: 1, g: 0.5, b: 0.1 },
    scaleOverTime: {
      start: 1.0,
      end: 0.0
    },
    physics: {
      enabled: true,
      forces: {
        wind: {
          direction: { x: 0, y: 1, z: 0 },
          strength: 2,
          turbulence: 0.3
        }
      }
    }
  };

  // Custom modifiers
  modifiers = {
    intensity: (config, value) => ({
      ...config,
      particleCount: Math.floor(config.particleCount * value),
      speed: {
        min: config.speed.min * value,
        max: config.speed.max * value
      }
    }),
    heat: (config, value) => ({
      ...config,
      color: {
        r: 1,
        g: 0.2 + (value * 0.3),
        b: 0.1
      }
    })
  };
}

// Register the pattern
ParticlePatternRegistry.registerPattern(new FirePattern());

// Use the pattern with overrides
emitter.emitEffect('fire', position, {
  patternModifiers: {
    intensity: 1.5,  // 50% more particles and speed
    heat: 0.8       // Hotter fire (more yellow)
  },
  // Override any default config
  lifetime: 2.0,    // Longer lifetime
  size: 0.5        // Larger particles
});
```

### Using Configuration Files

You can combine patterns and custom configurations in YAML:

```yaml
effects:
  campfire:
    pattern: fire          # Use fire pattern as base
    patternModifiers:
      intensity: 0.7      # Smaller fire
      heat: 0.3          # Cooler fire (more red)
    # Override pattern defaults
    spread: 20           
    physics:
      forces:
        wind:
          strength: 1.5   # Less wind effect

  inferno:
    pattern: fire
    patternModifiers:
      intensity: 2.0      # Bigger fire
      heat: 1.0          # Hottest fire (more yellow)
    # Add additional effects
    rotationSpeed:
      min: 90
      max: 180
``` 