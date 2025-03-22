# Upgrading to Hytopia Model Particles v1.0.6

This new version fixes issues with particle visibility and entity spawning. The update ensures that particles are correctly rendered in the game world.

## Upgrading Your HyFire2 Project

### Option 1: Using the Local Version

1. Link the local package to your HyFire2 project:
```bash
# From the hytopia-model-particles directory
npm link

# From your HyFire2 project directory
npm link hytopia-model-particles
```

2. Check that the linked version is being used:
```bash
npm list | grep hytopia-model-particles
```

### Option 2: Manual Package Installation

1. Create a `.tgz` package of the updated plugin:
```bash
# From the hytopia-model-particles directory
npm pack
```

2. Install the local package file in your HyFire2 project:
```bash
# From your HyFire2 project directory
npm install /path/to/hytopia-model-particles-1.0.6.tgz
```

### Option 3: Update Using Git

1. Update the dependency in your package.json:
```json
"dependencies": {
  "hytopia-model-particles": "github:yourusername/hytopia-model-particles#fix-particle-visibility"
}
```

2. Run npm install to update the package:
```bash
npm install
```

## Verifying the Update

To verify the update is working:

1. Start your HyFire2 project with `npm run dev`
2. Check the console logs for:
   - "ParticlePatternRegistry initialized successfully"
   - "ParticleEmitter initialized successfully"
   - "Particle spawned at position: x, y, z" messages (when particles are created)

## Key Changes

The main fixes in this update include:

1. Proper entity spawning in Particle.ts
2. Fixed position updating in the update method
3. Improved despawning logic
4. Enhanced plugin initialization and exports

## Testing the Particles

If you want to test the particle system explicitly, you can add this line to your GameManager.ts:

```typescript
// Inside the update method or a suitable place where effects should be triggered
if (particleEmitter) {
  particleEmitter.emitEffect('explosion', { x: 0, y: 3, z: 0 });
}
```

This will create an explosion effect at coordinates (0, 3, 0) whenever the code runs.