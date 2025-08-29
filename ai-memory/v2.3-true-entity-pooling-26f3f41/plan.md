# V2.3 True Entity Pooling Implementation Plan

## Architecture
1. **Particle Pool Management**
   - Pre-create pool of particle entities at startup
   - Park inactive particles off-screen with physics disabled
   - Reuse particles by teleporting and re-enabling physics

2. **Core Changes**
   - Modify Particle class to support pooling lifecycle
   - Implement ParticlePool class for entity management
   - Update ParticleSystemV2 to use pooled particles

3. **Physics Handling**
   - Disable physics when parking particles
   - Reset velocity/forces when activating from pool
   - Handle CCD (Continuous Collision Detection) issues

4. **Performance Optimizations**
   - Gradual pool building (10 entities per tick)
   - Configurable pool size (default 200)
   - Memory-efficient data structures

## Key Files
- `src/core/Particle.ts` - Pooling logic in Particle class
- `src/core/ParticlePool.ts` - Pool management
- `src/ParticleSystemV2.ts` - System integration
- `src/physics/PhysicsForces.ts` - Physics handling