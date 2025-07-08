import { World } from 'hytopia';
import { 
  ParticleSystem, 
  ParticleEffect,
  AnimationCurve,
  ColorGradient,
  PatternRegistry,
  EnhancedYAMLLoader
} from 'hytopia-model-particles';

export function initParticleShowcase(world: World) {
  // Create particle system with all v2.1.0 features enabled
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

  // Register animated explosion effect
  const animatedExplosion: ParticleEffect = {
    name: 'animated_explosion',
    config: {
      modelUri: 'models/particle_sphere.fbx',
      lifetime: 2000,
      mass: 0.1,
      friction: 0.3,
      bounciness: 0.5,
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
            { time: 0.3, color: { r: 255, g: 150, b: 50 } },
            { time: 0.7, color: { r: 200, g: 50, b: 20 } },
            { time: 1.0, color: { r: 100, g: 20, b: 10 } }
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
  };
  particleSystem.registerEffect(animatedExplosion);

  // Register spiral magic effect
  const spiralMagic: ParticleEffect = {
    name: 'spiral_magic',
    config: {
      modelUri: 'models/particle_star.fbx',
      lifetime: 3000,
      animations: {
        scaleOverTime: {
          start: 0.2,
          end: 0.8,
          curve: { type: 'linear' }
        },
        colorOverTime: {
          type: 'linear',
          keyframes: [
            { time: 0, color: { r: 100, g: 50, b: 255 } },
            { time: 0.5, color: { r: 200, g: 100, b: 255 } },
            { time: 1.0, color: { r: 255, g: 200, b: 255 } }
          ]
        },
        opacityOverTime: {
          start: 0.8,
          end: 0.0
        },
        rotationOverTime: {
          velocity: 180,
          acceleration: 30
        }
      }
    },
    count: 30,
    pattern: 'spiral',
    patternModifiers: {
      radius: 1.5,
      height: 4,
      rotations: 3,
      velocityScale: 0.5
    }
  };
  particleSystem.registerEffect(spiralMagic);

  // Register wave energy effect
  const waveEnergy: ParticleEffect = {
    name: 'wave_energy',
    config: {
      modelUri: 'models/particle_energy.fbx',
      lifetime: 2500,
      animations: {
        scaleOverTime: {
          start: 0.3,
          end: 0.1,
          curve: { type: 'easeInOut' }
        },
        colorOverTime: {
          type: 'smooth',
          keyframes: [
            { time: 0, color: { r: 50, g: 255, b: 200 } },
            { time: 1.0, color: { r: 100, g: 200, b: 255 } }
          ]
        }
      }
    },
    count: 40,
    pattern: 'wave',
    patternModifiers: {
      wavelength: 4,
      amplitude: 1.5,
      spread: 5,
      waves: 3
    }
  };
  particleSystem.registerEffect(waveEnergy);

  // Register ring pulse effect
  const ringPulse: ParticleEffect = {
    name: 'ring_pulse',
    config: {
      modelUri: 'models/particle_glow.fbx',
      lifetime: 1500,
      animations: {
        scaleOverTime: {
          start: 0.5,
          end: 0.2
        },
        opacityOverTime: {
          start: 1.0,
          end: 0.0,
          curve: { type: 'linear' }
        }
      }
    },
    count: 30,
    pattern: 'ring',
    patternModifiers: {
      radius: 2,
      expansionSpeed: 5,
      rings: 2,
      wobble: 0.2
    }
  };
  particleSystem.registerEffect(ringPulse);

  // Register fountain effect
  const magicFountain: ParticleEffect = {
    name: 'magic_fountain',
    config: {
      modelUri: 'models/particle_drop.fbx',
      lifetime: 4000,
      mass: 0.2,
      useGravity: true,
      gravityScale: 0.5,
      animations: {
        colorOverTime: {
          type: 'smooth',
          keyframes: [
            { time: 0, color: { r: 100, g: 150, b: 255 } },
            { time: 0.5, color: { r: 150, g: 200, b: 255 } },
            { time: 1.0, color: { r: 200, g: 220, b: 255 } }
          ]
        },
        scaleOverTime: {
          start: 0.4,
          end: 0.1
        }
      }
    },
    count: 100,
    pattern: 'fountain',
    patternModifiers: {
      radius: 0.5,
      height: 6,
      spread: 25,
      velocityMin: 4,
      velocityMax: 8
    }
  };
  particleSystem.registerEffect(magicFountain);

  // Example spawn functions
  const spawnShowcase = {
    // Basic animated explosion
    explosion: (position: Vector3Like) => {
      particleSystem.spawn('animated_explosion', position, { priority: 10 });
    },

    // Spiral magic effect
    spiralMagic: (position: Vector3Like) => {
      particleSystem.spawn('spiral_magic', position, { priority: 5 });
    },

    // Wave energy blast
    waveBlast: (position: Vector3Like) => {
      particleSystem.spawn('wave_energy', position, { priority: 8 });
    },

    // Ring pulse
    ringPulse: (position: Vector3Like) => {
      particleSystem.spawn('ring_pulse', position, { priority: 7 });
    },

    // Magic fountain
    fountain: (position: Vector3Like) => {
      particleSystem.spawn('magic_fountain', position, { priority: 3 });
    },

    // Composite effect - explosion + ring
    megaBlast: (position: Vector3Like) => {
      particleSystem.spawn('animated_explosion', position, { priority: 10 });
      setTimeout(() => {
        particleSystem.spawn('ring_pulse', position, { priority: 9 });
      }, 200);
    },

    // Performance test - spawn many particles
    stressTest: (position: Vector3Like) => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const offset = {
            x: position.x + (Math.random() - 0.5) * 5,
            y: position.y,
            z: position.z + (Math.random() - 0.5) * 5
          };
          particleSystem.spawn('spiral_magic', offset, { priority: 1 });
        }, i * 100);
      }
    },

    // Get performance report
    getPerformance: () => {
      const report = particleSystem.getPerformanceReport();
      const queueStatus = particleSystem.getQueueStatus();
      console.log('Performance Report:', report);
      console.log('Queue Status:', queueStatus);
      return { report, queueStatus };
    }
  };

  return {
    particleSystem,
    spawn: spawnShowcase
  };
}

// Usage example:
// const showcase = initParticleShowcase(world);
// showcase.spawn.explosion({ x: 0, y: 0, z: 0 });
// showcase.spawn.spiralMagic({ x: 5, y: 0, z: 5 });
// showcase.spawn.megaBlast({ x: -5, y: 0, z: -5 });