# Hytopia Model Particles v2.1.0

An advanced particle system plugin for the Hytopia SDK featuring particle animations, new patterns, performance monitoring, and enhanced configuration support.

## ✨ New in v2.1.0

- 🎬 **Particle Animations** - Scale, color, opacity, and rotation animations over lifetime
- 🌊 **New Patterns** - Spiral, Wave, Ring, and Fountain patterns added
- 📊 **Performance Monitoring** - Adaptive quality with FPS tracking and auto-adjustment
- 🎨 **Enhanced Effects** - Color gradients, animation curves, and visual richness
- 📝 **Advanced YAML** - Template inheritance and hot reload support
- 🚦 **Effect Queue** - Priority-based spawning with performance optimization
- 🔧 **Pattern Registry** - Compose and combine patterns dynamically

## 🚀 Quick Start

```typescript
import { ParticleSystem, AnimationCurve } from 'hytopia-model-particles';
import { Entity } from 'hytopia';

// Initialize with v2.1.0 features
const particleSystem = new ParticleSystem(world, {
  maxParticles: 1000,
  performance: {
    enableAdaptiveQuality: true,
    targetFPS: 60,
    qualityLevels: {
      high: { maxParticles: 1000, particleScale: 1.0 },
      medium: { maxParticles: 500, particleScale: 0.8 },
      low: { maxParticles: 200, particleScale: 0.6 }
    }
  },
  debug: true,
  entityFactory: (config) => new Entity(config)
});

// Register an animated explosion effect
particleSystem.registerEffect({
  name: 'animated_explosion',
  config: {
    modelUri: 'models/particle_sphere.fbx',
    lifetime: 2000,
    mass: 0.1,
    useGravity: true,
    animations: {
      scaleOverTime: {
        start: 0.5,
        end: 2.0,
        curve: { type: 'easeOut' }
      },
      colorOverTime: {
        type: 'smooth',
        keyframes: [
          { time: 0, color: { r: 255, g: 255, b: 100 } },
          { time: 0.5, color: { r: 255, g: 150, b: 50 } },
          { time: 1.0, color: { r: 200, g: 50, b: 20 } }
        ]
      },
      opacityOverTime: {
        start: 1.0,
        end: 0.0,
        curve: { type: 'easeIn' }
      }
    }
  },
  count: 50,
  pattern: 'explosion',
  patternModifiers: {
    intensity: 1.5,
    spread: 2.0
  }
});

// Spawn with priority
particleSystem.spawn('animated_explosion', position, { priority: 10 });
```

## 🎬 Particle Animations

### Scale Animation
```typescript
animations: {
  scaleOverTime: {
    start: 0.2,
    end: 1.5,
    curve: { type: 'easeOut' } // 'linear', 'easeIn', 'easeOut', 'easeInOut'
  }
}
```

### Color Gradients
```typescript
animations: {
  colorOverTime: {
    type: 'smooth', // or 'linear'
    keyframes: [
      { time: 0, color: { r: 255, g: 255, b: 200 } },
      { time: 0.3, color: { r: 255, g: 200, b: 100 } },
      { time: 0.7, color: { r: 255, g: 100, b: 50 } },
      { time: 1.0, color: { r: 100, g: 20, b: 10 } }
    ]
  }
}
```

### Opacity Fading
```typescript
animations: {
  opacityOverTime: {
    start: 1.0,
    end: 0.0,
    curve: { type: 'easeIn' }
  }
}
```

### Rotation Animation
```typescript
animations: {
  rotationOverTime: {
    velocity: 180, // degrees per second
    acceleration: 30 // optional acceleration
  }
}
```

## 🌊 New Pattern System

### Spiral Pattern
```typescript
particleSystem.spawnWithPattern('spiral', config, position, {
  radius: 2,        // Spiral radius
  height: 4,        // Total height
  rotations: 3,     // Number of rotations
  velocityScale: 1  // Velocity multiplier
});
```

### Wave Pattern
```typescript
particleSystem.spawnWithPattern('wave', config, position, {
  wavelength: 4,    // Distance between peaks
  amplitude: 1.5,   // Wave height
  spread: 5,        // Horizontal spread
  waves: 3          // Number of wave cycles
});
```

### Ring Pattern
```typescript
particleSystem.spawnWithPattern('ring', config, position, {
  radius: 3,           // Ring radius
  expansionSpeed: 5,   // Outward velocity
  rings: 2,            // Number of concentric rings
  wobble: 0.3         // Randomness factor
});
```

### Fountain Pattern
```typescript
particleSystem.spawnWithPattern('fountain', config, position, {
  radius: 0.5,      // Spawn radius
  height: 6,        // Maximum height
  spread: 30,       // Angle spread in degrees
  velocityMin: 3,   // Minimum velocity
  velocityMax: 7    // Maximum velocity
});
```

## 📊 Performance Monitoring

### Adaptive Quality
The system automatically adjusts particle count and quality based on FPS:

```typescript
const metrics = particleSystem.getPerformanceReport();
console.log(metrics);
// Output: {
//   currentFPS: 58,
//   averageFPS: 59.2,
//   qualityLevel: 'high',
//   particleCount: 245,
//   droppedFrames: 2
// }
```

### Effect Queue
Priority-based spawning prevents frame drops:

```typescript
// High priority effects spawn first
particleSystem.spawn('explosion', pos, { priority: 10 });
particleSystem.spawn('smoke', pos, { priority: 5 });
particleSystem.spawn('sparks', pos, { priority: 3 });
```

## 📝 Enhanced YAML Configuration

### Template Inheritance
```yaml
templates:
  base_magic:
    lifetime: 3000
    physics:
      mass: 0.1
      useGravity: false
    visual:
      opacityOverTime:
        start: 1.0
        end: 0.0
        curve: easeIn

effects:
  fire_spell:
    extends: base_magic
    model: models/fire_particle.fbx
    count: 40
    pattern: spiral
    visual:
      colorOverTime:
        type: smooth
        keyframes:
          - time: 0
            color: { r: 255, g: 200, b: 100 }
          - time: 1.0
            color: { r: 255, g: 50, b: 0 }
```

### Hot Reload (Development)
```typescript
const particleSystem = new ParticleSystem(world, {
  configPath: 'src/particles/effects',
  enableHotReload: true // Auto-reload YAML changes
});
```

## 🔧 Pattern Composition

Combine multiple patterns:

```typescript
import { PatternRegistry } from 'hytopia-model-particles';

const registry = PatternRegistry.getInstance();

// Create composite pattern
const megaBlast = registry.composePatterns(
  ['explosion', 'ring', 'spiral'],
  [0.5, 0.3, 0.2] // weights
);

particleSystem.registerPattern('mega_blast', megaBlast);
```

## 💡 Complete Examples

### Magic Spell Effect
```typescript
particleSystem.registerEffect({
  name: 'magic_cast',
  config: {
    modelUri: 'models/star_particle.fbx',
    lifetime: 3000,
    animations: {
      scaleOverTime: {
        start: 0.1,
        end: 0.5,
        curve: { type: 'easeOut' }
      },
      colorOverTime: {
        type: 'smooth',
        keyframes: [
          { time: 0, color: { r: 100, g: 50, b: 255 } },
          { time: 0.5, color: { r: 150, g: 100, b: 255 } },
          { time: 1.0, color: { r: 255, g: 200, b: 255 } }
        ]
      },
      rotationOverTime: {
        velocity: 360,
        acceleration: 180
      }
    }
  },
  count: 30,
  pattern: 'spiral',
  patternModifiers: {
    radius: 1.5,
    height: 3,
    rotations: 2
  }
});
```

### Environmental Effects
```typescript
// Rain
particleSystem.registerEffect({
  name: 'rain',
  config: {
    modelUri: 'models/raindrop.fbx',
    lifetime: 2000,
    mass: 0.1,
    useGravity: true,
    gravityScale: 2.0,
    animations: {
      opacityOverTime: {
        start: 0.6,
        end: 0.0
      }
    }
  },
  count: 200,
  pattern: 'stream',
  velocityMin: { x: -0.5, y: -20, z: -0.5 },
  velocityMax: { x: 0.5, y: -15, z: 0.5 }
});

// Fireflies
particleSystem.registerEffect({
  name: 'fireflies',
  config: {
    modelUri: 'models/glow_particle.fbx',
    lifetime: 10000,
    animations: {
      scaleOverTime: {
        start: 0.1,
        end: 0.2
      },
      colorOverTime: {
        type: 'smooth',
        keyframes: [
          { time: 0, color: { r: 255, g: 255, b: 100 } },
          { time: 0.5, color: { r: 200, g: 255, b: 100 } },
          { time: 1.0, color: { r: 255, g: 255, b: 100 } }
        ]
      },
      opacityOverTime: {
        start: 0.0,
        end: 1.0,
        curve: { type: 'easeInOut' }
      }
    }
  },
  count: 20,
  pattern: 'wave',
  patternModifiers: {
    wavelength: 8,
    amplitude: 2,
    spread: 10
  }
});
```

## 🏭 Integration with HyFire

See `src/particles/ParticlePluginV2.1Integration.ts` for a complete integration example with weapon effects, grenades, and game-specific particles.

## 📚 API Reference

### New in v2.1.0

#### ParticleAnimations
```typescript
interface ParticleAnimations {
  scaleOverTime?: {
    start: number;
    end: number;
    curve?: AnimationCurve;
  };
  colorOverTime?: ColorGradient;
  opacityOverTime?: {
    start: number;
    end: number;
    curve?: AnimationCurve;
  };
  rotationOverTime?: {
    velocity: number;
    acceleration?: number;
  };
}
```

#### Performance Options
```typescript
interface PerformanceOptions {
  enableAdaptiveQuality?: boolean;
  targetFPS?: number;
  qualityLevels?: {
    high: { maxParticles: number; particleScale?: number };
    medium: { maxParticles: number; particleScale?: number };
    low: { maxParticles: number; particleScale?: number };
  };
  monitoringInterval?: number;
}
```

## 🔄 Migration from v2.0.0

v2.1.0 is fully backward compatible. To use new features:

1. Add `animations` to your particle configs
2. Use new patterns with `pattern` field in effects
3. Enable performance monitoring in options
4. Optionally use YAML templates for cleaner configs

## 📄 License

MIT