"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticleEmitter = void 0;
const ParticleConfigLoader_1 = require("./ParticleConfigLoader");
const ParticlePool_1 = require("./ParticlePool");
const ParticlePatternsRegistry_1 = require("./ParticlePatternsRegistry");
const utils_1 = require("./utils");
const ParticleEffectQueue_1 = require("./ParticleEffectQueue");
const FPS_HISTORY_SIZE = 60; // Keep track of last 60 frames (1 second at 60fps)
const TARGET_FPS = 60;
const FRAME_TIME_TARGET = 1000 / TARGET_FPS;
const PERFORMANCE_SMOOTHING = 0.95; // How smooth the performance adaptation should be
class ParticleEmitter {
    constructor(world, config) {
        this.effectConfigs = {};
        this.pools = {};
        this.adaptivePerformance = true;
        this.maxParticles = 500;
        this.avgFps = 60;
        this.lastUpdateTime = performance.now();
        // Performance monitoring
        this.metrics = {
            lastFrameTime: performance.now(),
            frameCount: 0,
            averageFrameTime: FRAME_TIME_TARGET,
            particleReductionFactor: 1.0,
            activeParticleCount: 0,
            poolSize: 0,
            fpsHistory: new Array(FPS_HISTORY_SIZE).fill(TARGET_FPS),
            droppedFrames: 0
        };
        this.world = world;
        this.effectQueue = new ParticleEffectQueue_1.ParticleEffectQueue({
            maxQueueSize: 1000,
            batchSize: 10,
            maxEffectsPerFrame: Math.floor(this.maxParticles * 0.1),
            defaultMaxAge: 1000
        });
        // Initialize pools with default options
        const defaultPoolOptions = {
            cellSize: 10,
            sleepDistance: 100,
            cleanupCheckInterval: 1000,
            bounds: {
                min: { x: -1000, y: -1000, z: -1000 },
                max: { x: 1000, y: 1000, z: 1000 }
            }
        };
        if (config) {
            if (typeof config === 'string') {
                this.loadConfigFromFile(config);
            }
            else {
                this.applyConfig(config, defaultPoolOptions);
            }
        }
        else {
            this.applyConfig(this.getDefaultConfig(), defaultPoolOptions);
        }
    }
    static fromYaml(configFilePath, world) {
        return new ParticleEmitter(world, configFilePath);
    }
    loadConfigFromFile(filePath) {
        try {
            const configObj = (0, ParticleConfigLoader_1.loadParticleConfig)(filePath);
            (0, ParticleConfigLoader_1.validateConfig)(configObj);
            this.applyConfig(configObj);
        }
        catch (err) {
            console.error('Error loading config, using defaults:', err);
            this.applyConfig(this.getDefaultConfig());
        }
    }
    applyConfig(configObj, poolOptions) {
        const defaults = this.getDefaultConfig();
        const merged = { effects: {}, global: {} };
        // Merge global settings
        merged.global = Object.assign(Object.assign({}, defaults.global), configObj.global);
        // Apply global settings
        if (merged.global) {
            this.adaptivePerformance = merged.global.adaptivePerformance !== false;
            if (merged.global.maxParticles) {
                this.maxParticles = merged.global.maxParticles;
            }
            // Update pool options if provided in global config
            if (poolOptions && merged.global.poolOptions) {
                Object.assign(poolOptions, merged.global.poolOptions);
            }
        }
        // Initialize effect pools with options
        this.effectConfigs = merged.effects;
        this.pools = {};
        for (const effectName in this.effectConfigs) {
            this.pools[effectName] = new ParticlePool_1.ParticlePool(poolOptions);
        }
    }
    getDefaultConfig() {
        return {
            effects: {
                explosion: ParticlePatternsRegistry_1.ParticlePatternRegistry.generateConfig('explosion'),
                burst: ParticlePatternsRegistry_1.ParticlePatternRegistry.generateConfig('burst'),
                hit: ParticlePatternsRegistry_1.ParticlePatternRegistry.generateConfig('hit'),
            },
            global: {
                adaptivePerformance: true,
                maxParticles: 500,
            },
        };
    }
    queueEffect(effectName, position, overrides, options) {
        if (!this.effectConfigs[effectName]) {
            console.warn(`Effect "${effectName}" not defined.`);
            return false;
        }
        return this.effectQueue.enqueue(effectName, position, overrides, options);
    }
    emitQueuedEffects() {
        const effects = this.effectQueue.dequeueEffects();
        for (const effect of effects) {
            this.emitEffect(effect.effectName, effect.position, effect.overrides);
        }
    }
    emitEffect(effectName, position, overrides) {
        var _a, _b;
        const cfg = this.effectConfigs[effectName];
        if (!cfg) {
            console.warn(`Effect "${effectName}" not defined.`);
            return;
        }
        const effectiveCfg = Object.assign({}, cfg);
        // Apply pattern and overrides
        if ((overrides === null || overrides === void 0 ? void 0 : overrides.pattern) || cfg.pattern) {
            const patternName = (overrides === null || overrides === void 0 ? void 0 : overrides.pattern) || cfg.pattern;
            if (patternName) {
                const pattern = ParticlePatternsRegistry_1.ParticlePatternRegistry.getPattern(patternName);
                if (pattern) {
                    Object.assign(effectiveCfg, pattern.generate(Object.assign(Object.assign({}, cfg), overrides)));
                }
            }
        }
        else {
            Object.assign(effectiveCfg, overrides);
        }
        // Apply performance-based particle reduction
        let count = Math.max(1, Math.floor(effectiveCfg.particleCount * this.metrics.particleReductionFactor));
        for (let i = 0; i < count; i++) {
            if (this.getTotalActiveParticles() >= this.maxParticles)
                break;
            const pool = this.pools[effectName];
            const particle = pool.getParticle(effectiveCfg.model, effectiveCfg.size, ((_a = effectiveCfg.physics) === null || _a === void 0 ? void 0 : _a.enabled) ? effectiveCfg.physics.rigidBody : undefined, this.maxParticles);
            if (!particle)
                continue;
            const initSpeed = (0, utils_1.randomRange)(effectiveCfg.speed.min, effectiveCfg.speed.max);
            const baseDir = effectiveCfg.direction || null;
            const dir = (0, utils_1.randomDirectionWithinCone)(baseDir, effectiveCfg.spread);
            const velocity = {
                x: dir.x * initSpeed,
                y: dir.y * initSpeed,
                z: dir.z * initSpeed,
            };
            particle.spawn(this.world, position, velocity, effectiveCfg.lifetime, (_b = effectiveCfg.physics) === null || _b === void 0 ? void 0 : _b.rigidBody);
        }
    }
    update(deltaTime) {
        const currentTime = performance.now();
        const actualDeltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;
        // Update performance metrics
        this.updatePerformanceMetrics(currentTime, actualDeltaTime);
        // Process queued effects
        this.emitQueuedEffects();
        // Update particles
        for (const effectName in this.pools) {
            this.pools[effectName].updateAll(deltaTime);
        }
        // Update metrics
        this.metrics.activeParticleCount = this.getTotalActiveParticles();
        this.metrics.poolSize = Object.values(this.pools).reduce((total, pool) => total + pool.getTotalParticleCount(), 0);
    }
    updatePerformanceMetrics(currentTime, deltaTime) {
        const frameTime = currentTime - this.metrics.lastFrameTime;
        this.metrics.frameCount++;
        // Update FPS history
        const currentFPS = 1000 / frameTime;
        this.metrics.fpsHistory.push(currentFPS);
        this.metrics.fpsHistory.shift();
        // Calculate average frame time with smoothing
        this.metrics.averageFrameTime =
            (this.metrics.averageFrameTime * PERFORMANCE_SMOOTHING) +
                (frameTime * (1 - PERFORMANCE_SMOOTHING));
        // Track dropped frames
        if (frameTime > FRAME_TIME_TARGET * 1.5) { // If frame took 50% longer than target
            this.metrics.droppedFrames++;
        }
        // Adjust particle reduction factor based on performance
        if (this.adaptivePerformance) {
            if (this.metrics.averageFrameTime > FRAME_TIME_TARGET) {
                // Reduce particles if we're not hitting target frame time
                this.metrics.particleReductionFactor *= 0.95;
            }
            else if (this.metrics.averageFrameTime < FRAME_TIME_TARGET * 0.8) {
                // Increase particles if we have headroom (but don't exceed 1.0)
                this.metrics.particleReductionFactor = Math.min(1.0, this.metrics.particleReductionFactor * 1.05);
            }
        }
        this.metrics.lastFrameTime = currentTime;
    }
    // Add method to get current performance metrics
    getPerformanceMetrics() {
        return Object.assign({}, this.metrics); // Return a copy to prevent external modification
    }
    getTotalActiveParticles() {
        let total = 0;
        for (const effectName in this.pools) {
            total += this.pools[effectName].getActiveParticleCount();
        }
        return total;
    }
    getQueueStats() {
        return this.effectQueue.getQueueStats();
    }
    clearQueue() {
        this.effectQueue.clear();
    }
    setCameraPosition(position) {
        for (const pool of Object.values(this.pools)) {
            pool.setCameraPosition(position);
        }
    }
    setWorldBounds(min, max) {
        for (const pool of Object.values(this.pools)) {
            pool.setWorldBounds(min, max);
        }
    }
    setSleepDistance(distance) {
        for (const pool of Object.values(this.pools)) {
            pool.setSleepDistance(distance);
        }
    }
    getCleanupStats() {
        const stats = {};
        for (const [effectName, pool] of Object.entries(this.pools)) {
            stats[effectName] = pool.getCleanupStats();
        }
        return stats;
    }
    cleanup() {
        // Cleanup all particle pools
        for (const pool of Object.values(this.pools)) {
            pool.dispose();
        }
        this.pools = {};
        this.effectConfigs = {};
    }
}
exports.ParticleEmitter = ParticleEmitter;
//# sourceMappingURL=ParticleEmitter.js.map