"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticlePool = void 0;
const SpatialGrid_1 = require("./SpatialGrid");
const ParticleLifecycleManager_1 = require("./ParticleLifecycleManager");
const ParticleDataBuffer_1 = require("./ParticleDataBuffer");
class ParticlePool {
    constructor(options = {}) {
        this.particles = [];
        this.cameraPosition = { x: 0, y: 0, z: 0 };
        const maxParticles = options.maxParticles || 1000;
        this.dataBuffer = new ParticleDataBuffer_1.ParticleDataBuffer(maxParticles);
        this.spatialGrid = new SpatialGrid_1.SpatialGrid(options.cellSize);
        this.lifecycleManager = new ParticleLifecycleManager_1.ParticleLifecycleManager({
            bounds: options.bounds,
            sleepDistance: options.sleepDistance,
            cleanupCheckInterval: options.cleanupCheckInterval
        });
    }
    getParticle(modelUri, size, rigidBodyOptions, maxPoolSize) {
        // Clean up any particles that should be removed
        this.cleanupInactiveParticles();
        // Find an unused particle in the pool
        for (let i = 0; i < this.particles.length; i++) {
            const flags = this.dataBuffer.getFlags(i);
            if (!(flags & ParticlePool.FLAG_SPAWNED)) {
                const particle = this.particles[i];
                // Initialize particle data
                this.dataBuffer.setScale(i, size || 1);
                this.dataBuffer.setFlags(i, ParticlePool.FLAG_SPAWNED);
                return particle;
            }
        }
        // No free particle found, create a new one if we haven't hit maxPoolSize
        if (this.particles.length < maxPoolSize) {
            const index = this.particles.length;
            // @ts-ignore - Using placeholder Entity creation for now
            const newParticle = new types_1.Entity({
                modelUri,
                modelScale: size,
                rigidBodyOptions,
                index // Store the buffer index in the entity
            });
            this.particles.push(newParticle);
            this.dataBuffer.setScale(index, size || 1);
            this.dataBuffer.setFlags(index, ParticlePool.FLAG_SPAWNED);
            return newParticle;
        }
        return null;
    }
    releaseParticle(p) {
        const index = p.index;
        if (typeof index !== 'undefined') {
            this.spatialGrid.removeParticle(p);
            this.dataBuffer.setFlags(index, 0); // Clear all flags
            p.despawn();
        }
    }
    updateAll(deltaTime) {
        // Update lifecycle manager with current state
        this.lifecycleManager.update(this.particles, this.cameraPosition, deltaTime);
        // Prepare batch updates
        const updates = [];
        // Update active particles
        for (let i = 0; i < this.particles.length; i++) {
            const flags = this.dataBuffer.getFlags(i);
            if ((flags & ParticlePool.FLAG_SPAWNED) && !(flags & ParticlePool.FLAG_SLEEPING)) {
                const p = this.particles[i];
                const oldPosition = this.dataBuffer.getPosition(i);
                // Update particle
                p.update(deltaTime);
                // Queue update
                updates.push({
                    index: i,
                    position: p.position,
                    velocity: p.velocity
                });
                // Update spatial grid if position changed
                if (oldPosition.x !== p.position.x ||
                    oldPosition.y !== p.position.y ||
                    oldPosition.z !== p.position.z) {
                    this.spatialGrid.updateParticlePosition(p, oldPosition);
                }
            }
        }
        // Apply batch updates
        if (updates.length > 0) {
            this.dataBuffer.updateParticles(updates);
        }
    }
    cleanupInactiveParticles() {
        this.particles = this.particles.filter(p => {
            if (!p.isSpawned && this.lifecycleManager.shouldCleanup(p, performance.now())) {
                this.lifecycleManager.cleanupParticle(p, 'manual');
                return false;
            }
            return true;
        });
    }
    setWorldBounds(min, max) {
        this.lifecycleManager.setBounds({ min, max });
    }
    setCameraPosition(position) {
        this.cameraPosition = position;
    }
    setSleepDistance(distance) {
        this.lifecycleManager.setSleepDistance(distance);
    }
    getActiveParticleCount() {
        return this.particles.filter(p => p.isSpawned && !p.isSleeping).length;
    }
    getTotalParticleCount() {
        return this.particles.length;
    }
    getSleepingParticleCount() {
        return this.particles.filter(p => p.isSpawned && p.isSleeping).length;
    }
    getCleanupStats() {
        return this.lifecycleManager.getCleanupStats();
    }
    // Spatial query methods
    getNearbyParticles(position, radius) {
        return this.spatialGrid.getNearbyParticles(position, radius);
    }
    getParticlesInBounds(min, max) {
        return this.spatialGrid.getParticlesInBounds(min, max);
    }
    getCellCount() {
        return this.spatialGrid.getCellCount();
    }
    // New method to get position buffer for rendering
    getPositionBuffer() {
        return this.dataBuffer.getPositionBuffer();
    }
    // Update particle state flags
    setParticleSleeping(index, sleeping) {
        let flags = this.dataBuffer.getFlags(index);
        if (sleeping) {
            flags |= ParticlePool.FLAG_SLEEPING;
        }
        else {
            flags &= ~ParticlePool.FLAG_SLEEPING;
        }
        this.dataBuffer.setFlags(index, flags);
    }
    // Add new methods for batch operations
    updateParticlesBatch(updates) {
        const bufferUpdates = updates.map(update => ({
            index: update.particle.index,
            position: update.position,
            velocity: update.velocity,
            scale: update.scale,
            lifetime: update.lifetime,
            flags: update.flags
        }));
        this.dataBuffer.updateParticles(bufferUpdates);
    }
    // Add method to handle resizing
    resize(newCapacity) {
        this.dataBuffer.resize(newCapacity);
    }
    // Add cleanup method
    dispose() {
        this.dataBuffer.dispose();
        this.spatialGrid.clear();
        this.particles = [];
    }
    // Add memory usage tracking
    getMemoryStats() {
        return {
            bufferSize: this.dataBuffer.getMemoryUsage(),
            particleCount: this.particles.length,
            activeCount: this.getActiveParticleCount(),
            sleepingCount: this.getSleepingParticleCount()
        };
    }
}
exports.ParticlePool = ParticlePool;
// Flags for particle state
ParticlePool.FLAG_SPAWNED = 1;
ParticlePool.FLAG_SLEEPING = 2;
//# sourceMappingURL=ParticlePool.js.map