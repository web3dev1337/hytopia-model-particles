# Hytopia Model Particles

A fully functional particle system plugin for the Hytopia SDK with physics support, object pooling, and extensible pattern system.

## ✨ Features

- 🎯 **100% Hytopia SDK Compatible** - Built specifically for Hytopia SDK v0.6.27+
- 🚀 **High Performance** - Object pooling with configurable particle limits
- 🎨 **Pattern System** - Extensible patterns (explosion, stream, custom)
- 📝 **YAML Configuration** - Load particle effects from YAML files
- ⚡ **Full Physics** - Proper rigid body physics with collision groups
- 🔧 **TypeScript Support** - Fully typed with .d.ts files
- 🏭 **Entity Factory Pattern** - Works with any Hytopia game's model context

## 📦 Installation

```bash
npm install hytopia-model-particles
```

## 🚀 Quick Start

```typescript
import { ParticleSystem, YAMLLoader } from 'hytopia-model-particles';
import { Entity } from 'hytopia';

// Initialize with entity factory to access your game's models
const particleSystem = new ParticleSystem(world, {
  maxParticles: 500,
  autoCleanup: true,
  entityFactory: (config) => new Entity(config)
});

// Register a simple effect
particleSystem.registerEffect({
  name: 'explosion',
  config: {
    modelUri: 'models/particles/spark.gltf',
    modelScale: 0.3,
    lifetime: 3000,
    mass: 0.1,
    useGravity: true
  },
  count: 20,
  spread: 2,
  velocityMin: { x: -3, y: 1, z: -3 },
  velocityMax: { x: 3, y: 5, z: 3 }
});

// Spawn particles
particleSystem.spawn('explosion', position);
```

## 🏭 Entity Factory Pattern

The plugin uses an entity factory pattern to solve model loading issues. This allows the plugin to create entities in your game's context where models are already loaded:

```typescript
const particleSystem = new ParticleSystem(world, {
  entityFactory: (config) => new Entity(config) // Creates entities with your game's loaded models
});
```

## 🎨 Pattern System

### Built-in Patterns

```typescript
// Explosion pattern - particles spread outward in all directions
particleSystem.spawnWithPattern('explosion', particleConfig, position, {
  intensity: 1.5,
  count: 30
});

// Stream pattern - continuous flow of particles
particleSystem.spawnWithPattern('stream', particleConfig, position, {
  direction: { x: 0, y: 1, z: 0 },
  spread: 0.5,
  velocity: 2.0
});
```

### Custom Patterns

```typescript
import { Pattern } from 'hytopia-model-particles';

class SpiralPattern extends Pattern {
  generatePoints(): Vector3Like[] {
    const points: Vector3Like[] = [];
    for (let i = 0; i < this.count; i++) {
      const angle = (i / this.count) * Math.PI * 2 * 3; // 3 rotations
      const radius = (i / this.count) * 2;
      points.push({
        x: Math.cos(angle) * radius,
        y: i * 0.1,
        z: Math.sin(angle) * radius
      });
    }
    return points;
  }
}

particleSystem.registerPattern('spiral', new SpiralPattern());
```

## 📝 YAML Configuration

Create effect configurations in YAML:

```yaml
# effects/fire.yaml
name: fire
config:
  modelUri: models/particles/flame.gltf
  modelScale: 0.5
  lifetime: 2000
  mass: 0.01
  useGravity: false
  tintColor:
    r: 255
    g: 100
    b: 0
count: 15
spread: 0.5
velocityMin:
  x: -0.2
  y: 1
  z: -0.2
velocityMax:
  x: 0.2
  y: 3
  z: 0.2
```

Load and use:

```typescript
const fireEffect = YAMLLoader.loadEffect('effects/fire.yaml');
particleSystem.registerEffect(fireEffect);
particleSystem.spawn('fire', position);
```

## ⚡ Physics Configuration

Full physics support with Hytopia's Rapier integration:

```typescript
const particleConfig = {
  modelUri: 'models/particles/debris.gltf',
  modelScale: 0.2,
  lifetime: 5000,
  
  // Physics properties
  mass: 0.5,
  friction: 0.8,
  bounciness: 0.3,
  useGravity: true,
  
  // Collision settings
  collisionGroup: CollisionGroup.GROUP_2,
  collisionMask: CollisionGroup.BLOCK | CollisionGroup.GROUND
};
```

## 🚀 Performance Optimization

The system uses object pooling to maintain performance:

```typescript
const particleSystem = new ParticleSystem(world, {
  maxParticles: 1000,        // Maximum particle pool size
  autoCleanup: true,         // Automatically clean up inactive particles
  cleanupInterval: 1000,     // Cleanup check interval (ms)
  performanceMode: 'balanced' // 'high', 'balanced', or 'low'
});
```

## 📚 API Reference

### ParticleSystem

- `registerEffect(effect: ParticleEffect): void` - Register a reusable effect
- `registerPattern(name: string, pattern: Pattern): void` - Register a custom pattern
- `spawn(effectName: string, position: Vector3Like, options?: any): void` - Spawn a registered effect
- `spawnWithPattern(patternName: string, config: ParticleConfig, position: Vector3Like, modifiers?: any): void` - Spawn with pattern
- `despawnAll(): void` - Immediately despawn all active particles
- `update(): void` - Manual update (called automatically if autoCleanup is true)

### ParticleConfig

```typescript
interface ParticleConfig {
  modelUri: string;
  modelScale?: number;
  tintColor?: { r: number; g: number; b: number };
  lifetime?: number;
  mass?: number;
  friction?: number;
  bounciness?: number;
  useGravity?: boolean;
  collisionGroup?: number;
  collisionMask?: number;
}
```

## 💡 Examples

### Blood Splatter Effect
```typescript
particleSystem.registerEffect({
  name: 'blood',
  config: {
    modelUri: 'models/particles/blood.gltf',
    modelScale: 0.15,
    tintColor: { r: 150, g: 0, b: 0 },
    lifetime: 4000,
    mass: 0.05,
    friction: 0.9,
    bounciness: 0.1,
    useGravity: true
  },
  count: 8,
  spread: 1,
  velocityMin: { x: -2, y: 0, z: -2 },
  velocityMax: { x: 2, y: 3, z: 2 }
});
```

### Smoke Effect
```typescript
particleSystem.registerEffect({
  name: 'smoke',
  config: {
    modelUri: 'models/particles/smoke.gltf',
    modelScale: 1.0,
    tintColor: { r: 100, g: 100, b: 100 },
    lifetime: 6000,
    mass: 0.001,
    useGravity: false
  },
  count: 5,
  spread: 0.5,
  velocityMin: { x: -0.1, y: 0.5, z: -0.1 },
  velocityMax: { x: 0.1, y: 1, z: 0.1 }
});
```

## 🔄 Changelog

### v2.0.0
- Complete rewrite with working implementation
- Added entity factory pattern for proper model loading
- Full physics support with Rapier
- Pattern system implementation
- YAML configuration support
- Object pooling for performance

### v1.0.x
- Initial stub implementation (non-functional)

## 📄 License

MIT