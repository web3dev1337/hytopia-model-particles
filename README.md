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
    intensity: 0.5,  // Gentle flow
    spread: 15,      // Cone spread angle
    direction: { x: 0, y: 1, z: 0 }  // Upward direction
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
        spawnArea: { width: value, height: value }
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
       lightweight: true   // Use simplified physics
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