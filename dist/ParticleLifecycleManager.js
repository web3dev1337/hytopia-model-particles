"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticleLifecycleManager = void 0;
class ParticleLifecycleManager {
    constructor(options = {}) {
        this.cleanupStats = {
            totalCleaned: 0,
            byReason: {
                expired: 0,
                outOfBounds: 0,
                manual: 0,
                error: 0
            }
        };
        this.bounds = options.bounds;
        this.sleepDistance = options.sleepDistance || 100;
        this.cleanupCheckInterval = options.cleanupCheckInterval || 1000;
        this.lastCleanupCheck = performance.now();
        this.defaultSleepThreshold = options.defaultSleepThreshold || 0.1;
        this.defaultCleanupDelay = options.defaultCleanupDelay || 5000;
    }
    update(particles, cameraPosition, deltaTime) {
        const currentTime = performance.now();
        // Check if it's time for cleanup
        if (currentTime - this.lastCleanupCheck > this.cleanupCheckInterval) {
            this.performCleanup(particles);
            this.lastCleanupCheck = currentTime;
        }
        // Update sleep states and perform lifecycle checks
        for (const particle of particles) {
            if (!particle.isSpawned)
                continue;
            // Update particle's last update time
            particle.lastUpdateTime = currentTime;
            // Check if particle should be put to sleep
            if (!particle.isSleeping) {
                if (this.shouldSleep(particle, cameraPosition)) {
                    this.sleepParticle(particle);
                }
            }
            else {
                // Check if particle should wake up
                if (this.shouldWake(particle, cameraPosition)) {
                    this.wakeParticle(particle);
                }
            }
            // Check if particle should be cleaned up
            if (this.shouldCleanup(particle, currentTime)) {
                this.cleanupParticle(particle, 'expired');
            }
        }
    }
    shouldSleep(particle, cameraPosition) {
        // Check distance from camera
        const distanceSquared = Math.pow(particle.position.x - cameraPosition.x, 2) +
            Math.pow(particle.position.y - cameraPosition.y, 2) +
            Math.pow(particle.position.z - cameraPosition.z, 2);
        if (distanceSquared > this.sleepDistance * this.sleepDistance) {
            return true;
        }
        // Check velocity
        const sleepThreshold = particle.sleepThreshold || this.defaultSleepThreshold;
        const velocityMagnitudeSquared = particle.velocity.x * particle.velocity.x +
            particle.velocity.y * particle.velocity.y +
            particle.velocity.z * particle.velocity.z;
        return velocityMagnitudeSquared < sleepThreshold * sleepThreshold;
    }
    shouldWake(particle, cameraPosition) {
        const distanceSquared = Math.pow(particle.position.x - cameraPosition.x, 2) +
            Math.pow(particle.position.y - cameraPosition.y, 2) +
            Math.pow(particle.position.z - cameraPosition.z, 2);
        return distanceSquared <= this.sleepDistance * this.sleepDistance;
    }
    sleepParticle(particle) {
        particle.isSleeping = true;
        if (particle.sleep) {
            particle.sleep();
        }
        if (particle.rawRigidBody) {
            particle.rawRigidBody.setSleeping(true);
        }
    }
    wakeParticle(particle) {
        particle.isSleeping = false;
        if (particle.wake) {
            particle.wake();
        }
        if (particle.rawRigidBody) {
            particle.rawRigidBody.setSleeping(false);
        }
    }
    shouldCleanup(particle, currentTime) {
        if (particle.shouldCleanup && particle.shouldCleanup()) {
            return true;
        }
        // Check if particle is out of bounds
        if (this.bounds && this.isOutOfBounds(particle.position)) {
            return true;
        }
        // Check if particle has been despawned long enough for cleanup
        const cleanupDelay = particle.cleanupDelay || this.defaultCleanupDelay;
        if (!particle.isSpawned &&
            currentTime - particle.lastUpdateTime > cleanupDelay) {
            return true;
        }
        return false;
    }
    isOutOfBounds(position) {
        if (!this.bounds)
            return false;
        return position.x < this.bounds.min.x || position.x > this.bounds.max.x ||
            position.y < this.bounds.min.y || position.y > this.bounds.max.y ||
            position.z < this.bounds.min.z || position.z > this.bounds.max.z;
    }
    cleanupParticle(particle, reason) {
        try {
            if (particle.cleanup) {
                particle.cleanup();
            }
            // Update cleanup stats
            this.cleanupStats.totalCleaned++;
            this.cleanupStats.byReason[reason]++;
            // Try to estimate memory reclaimed
            if (!this.cleanupStats.memoryReclaimed) {
                this.cleanupStats.memoryReclaimed = 0;
            }
            // Rough estimate based on typical particle data
            this.cleanupStats.memoryReclaimed += 1024; // 1KB per particle (rough estimate)
        }
        catch (error) {
            console.error('Error cleaning up particle:', error);
            this.cleanupStats.byReason.error++;
        }
    }
    performCleanup(particles) {
        const currentTime = performance.now();
        for (const particle of particles) {
            if (this.shouldCleanup(particle, currentTime)) {
                const reason = this.isOutOfBounds(particle.position) ? 'outOfBounds' : 'expired';
                this.cleanupParticle(particle, reason);
            }
        }
    }
    setBounds(bounds) {
        this.bounds = bounds;
    }
    setSleepDistance(distance) {
        this.sleepDistance = distance;
    }
    getCleanupStats() {
        return Object.assign({}, this.cleanupStats);
    }
    resetCleanupStats() {
        this.cleanupStats = {
            totalCleaned: 0,
            byReason: {
                expired: 0,
                outOfBounds: 0,
                manual: 0,
                error: 0
            },
            memoryReclaimed: 0
        };
    }
}
exports.ParticleLifecycleManager = ParticleLifecycleManager;
//# sourceMappingURL=ParticleLifecycleManager.js.map