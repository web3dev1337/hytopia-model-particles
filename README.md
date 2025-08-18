# Hytopia Model Particles v2.3.0

Advanced particle system plugin for the Hytopia SDK featuring **TRUE entity pooling**, **physics forces**, **spatial optimization**, and **simplified initialization**.

## 🚀 What's New in v2.3.0

- 🎯 **TRUE Entity Pooling** - Entities stay spawned, just move between positions!
- 🚄 **Zero Spawn/Despawn Overhead** - Particles teleport instead of recreating
- 🏊 **Gradual Pool Building** - Builds 1000 entities at 10 per tick to avoid FPS drops
- 🎨 **Parking System** - Inactive particles hide at y=-1000 with physics disabled
- ⚡ **Fixed Velocity Application** - Particles explode properly when activated from pool

## Previous v2.2.0 Features

- 🏊 **Object Pooling** - Reuse particles for massive performance gains
- 🌊 **Physics Forces** - Global wind, turbulence, and vortex effects
- 🎯 **Spatial Optimization** - Update only particles near players
- ⚡ **TypedArray Buffers** - Efficient particle data storage
- 🎮 **Simplified API** - Works with minimal code, powerful when needed
- 🔧 **Backwards Compatible** - ParticleSystemV1 still available

## 📦 Installation

```bash
npm install hytopia-model-particles@2.3.0
```

## 🎯 Quick Start - Simple by Default!

```typescript
import { ParticleSystem } from 'hytopia-model-particles';

// Just works with minimal setup!
const particles = new ParticleSystem(world);

// Spawn with built-in effects
particles.spawn('explosion', position);
particles.spawn('smoke', position);
particles.spawn('spark', position);

// Or quickly register your own
particles.quickEffect('magic', {
  model: 'default',  // Uses built-in particle model
  count: 30,
  pattern: 'spiral'
});

particles.spawn('magic', position);
```

## 🏊 Object Pooling (Major Performance Win!)

```typescript
const particles = new ParticleSystem(world, {
  poolSize: 200,  // Pre-create 200 particles
  performance: {
    enablePooling: true  // Default: true
  }
});

// Check pool efficiency
const stats = particles.getPerformanceReport();
console.log(stats.poolStats);
// {
//   available: 150,
//   active: 50,
//   totalCreated: 200,
//   poolEfficiency: 1.0  // 100% reuse!
// }
```

## 🌊 Physics Forces

### Global Wind
```typescript
const particles = new ParticleSystem(world, {
  physics: {
    globalWind: { x: 5, y: 0, z: 0 },  // Constant wind
    turbulence: 0.3  // Add randomness
  }
});

// Change wind dynamically
particles.setGlobalWind({ x: -10, y: 2, z: 0 });
particles.setTurbulence(0.5);
```

### Vortex Effects
```typescript
// Add a tornado at position
particles.addVortex(
  { x: 10, y: 0, z: 10 },  // Position
  20,                      // Strength
  15                       // Radius
);

// Particles will spiral around vortex centers!
```

## 🎯 Spatial Optimization

```typescript
const particles = new ParticleSystem(world, {
  performance: {
    enableSpatialOptimization: true,
    updateRadius: 50  // Only update particles within 50 units of players
  }
});

// Particles far from all players automatically skip updates
// Great for large worlds with many effects!
```

## 💾 Memory Optimization

v2.2 uses TypedArray buffers internally for particle metadata:
- 75% less memory usage than objects
- Faster access to particle data
- Better CPU cache utilization

## 🎨 Complete Examples

### Fire Effect with Wind
```typescript
particles.registerEffect({
  name: 'fire',
  config: {
    modelUri: 'models/fire_particle.fbx',
    lifetime: 2000,
    tintColor: {
      type: 'smooth',
      keyframes: [
        { time: 0, color: { r: 255, g: 200, b: 100 } },
        { time: 0.5, color: { r: 255, g: 150, b: 50 } },
        { time: 1.0, color: { r: 200, g: 50, b: 20 } }
      ]
    },
    animations: {
      scaleOverTime: { start: 0.3, end: 0.8 },
      opacityOverTime: { start: 1, end: 0 }
    }
  },
  count: 40,
  pattern: 'fountain',
  velocityMin: { x: -1, y: 3, z: -1 },
  velocityMax: { x: 1, y: 6, z: 1 }
});

// Add wind effect
particles.setGlobalWind({ x: 3, y: 0, z: 0 });
particles.setTurbulence(0.4);

// Spawn fire
particles.spawn('fire', campfirePosition);
```

### Magic Portal with Vortex
```typescript
particles.registerEffect({
  name: 'portal',
  config: {
    modelUri: 'models/magic_particle.fbx',
    lifetime: 3000,
    useGravity: false,
    animations: {
      colorOverTime: {
        type: 'smooth',
        keyframes: [
          { time: 0, color: { r: 100, g: 50, b: 255 } },
          { time: 1, color: { r: 255, g: 100, b: 255 } }
        ]
      },
      rotationOverTime: { velocity: 360 }
    }
  },
  count: 50,
  pattern: 'ring'
});

// Add vortex at portal center
particles.addVortex(portalPosition, 15, 10);

// Spawn portal particles
particles.spawn('portal', portalPosition);
```

### Explosion with Physics
```typescript
// Built-in explosion already supports physics!
particles.spawn('explosion', position);

// Or customize it
particles.spawn('explosion', position, {
  count: 100,  // More particles
  velocity: { x: 0, y: 10, z: 0 }  // Upward bias
});
```

## 📊 Performance Monitoring

```typescript
const report = particles.getPerformanceReport();
console.log(report);
// {
//   currentFPS: 59,
//   particleCount: 245,
//   poolStats: {
//     available: 55,
//     active: 245,
//     poolEfficiency: 0.95
//   },
//   bufferStats: {
//     capacity: 1000,
//     used: 245,
//     utilization: 0.245
//   }
// }
```

## 🔄 Migration from v2.1

v2.2 is fully backwards compatible! Your existing code will work without changes.

To use new features:

```typescript
// Old way (still works)
const particles = new ParticleSystem(world, {
  maxParticles: 1000
});

// New way (with v2.2 features)
const particles = new ParticleSystem(world, {
  maxParticles: 1000,
  poolSize: 200,  // Enable pooling
  physics: {       // Enable physics
    globalWind: { x: 2, y: 0, z: 0 },
    turbulence: 0.3
  },
  performance: {   // Enable optimizations
    enableSpatialOptimization: true,
    updateRadius: 60
  }
});
```

## 🛠️ Advanced Configuration

### Full Options
```typescript
const particles = new ParticleSystem(world, {
  // Limits
  maxParticles: 2000,
  
  // Pooling
  poolSize: 500,
  
  // Physics
  physics: {
    globalWind: { x: 0, y: 0, z: 0 },
    turbulence: 0,
    enableForces: true
  },
  
  // Performance
  performance: {
    enableAdaptiveQuality: true,
    targetFPS: 60,
    enablePooling: true,
    enableSpatialOptimization: true,
    updateRadius: 50,
    qualityLevels: {
      high: { maxParticles: 2000 },
      medium: { maxParticles: 1000 },
      low: { maxParticles: 500 }
    }
  },
  
  // Entity factory (for custom entity creation)
  entityFactory: (config) => new Entity(config),
  
  // Debug mode
  debug: true
});
```

### Use ParticleSystemV1 (Legacy)
```typescript
import { ParticleSystemV1 } from 'hytopia-model-particles';

// Use old system if needed
const particles = new ParticleSystemV1(world, options);
```

## 🎮 Integration Example

```typescript
// In your game's weapon system
class WeaponEffects {
  private particles: ParticleSystem;
  
  constructor(world: World) {
    this.particles = new ParticleSystem(world, {
      poolSize: 300,
      physics: {
        globalWind: { x: 2, y: 0, z: 0 },
        turbulence: 0.2
      }
    });
    
    // Register weapon effects
    this.particles.quickEffect('muzzle_flash', {
      count: 5,
      lifetime: 200,
      pattern: 'explosion'
    });
    
    this.particles.quickEffect('bullet_impact', {
      count: 15,
      pattern: 'explosion',
      scale: 0.2
    });
  }
  
  onWeaponFire(position: Vector3Like) {
    this.particles.spawn('muzzle_flash', position, {
      priority: 10  // High priority
    });
  }
  
  onBulletHit(position: Vector3Like) {
    this.particles.spawn('bullet_impact', position);
    this.particles.spawn('smoke', position);
  }
}
```

## 🏆 Performance Tips

1. **Use Object Pooling** - Biggest performance win, enabled by default
2. **Set Appropriate Pool Size** - Based on your max concurrent particles
3. **Enable Spatial Optimization** - For large worlds
4. **Use Priority System** - Important effects spawn first
5. **Monitor Performance** - Check poolEfficiency and adjust

## 📚 API Reference

See [API Documentation](./docs/API.md) for complete reference.

## 🔧 Changelog

### v2.2.0
- Added object pooling system
- Added physics forces (wind, turbulence, vortex)
- Added spatial optimization
- Added TypedArray buffers
- Simplified initialization API
- Improved performance monitoring

### v2.1.0
- Added particle animations
- Added new patterns
- Added performance monitoring
- Added YAML configuration

### v2.0.0
- Initial release with entity factory pattern

## 📄 License

MIT