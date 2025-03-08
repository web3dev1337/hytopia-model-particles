import { Entity, Vector3, RigidBodyOptions, CleanupStats } from './types';
export declare class ParticlePool {
    private particles;
    private dataBuffer;
    private spatialGrid;
    private lifecycleManager;
    private cameraPosition;
    private static readonly FLAG_SPAWNED;
    private static readonly FLAG_SLEEPING;
    constructor(options?: {
        cellSize?: number;
        bounds?: {
            min: Vector3;
            max: Vector3;
        };
        sleepDistance?: number;
        cleanupCheckInterval?: number;
        maxParticles?: number;
    });
    getParticle(modelUri: string | undefined, size: number | undefined, rigidBodyOptions: RigidBodyOptions | undefined, maxPoolSize: number): Entity | null;
    releaseParticle(p: Entity): void;
    updateAll(deltaTime: number): void;
    private cleanupInactiveParticles;
    setWorldBounds(min: Vector3, max: Vector3): void;
    setCameraPosition(position: Vector3): void;
    setSleepDistance(distance: number): void;
    getActiveParticleCount(): number;
    getTotalParticleCount(): number;
    getSleepingParticleCount(): number;
    getCleanupStats(): CleanupStats;
    getNearbyParticles(position: Vector3, radius: number): Entity[];
    getParticlesInBounds(min: Vector3, max: Vector3): Entity[];
    getCellCount(): number;
    getPositionBuffer(): Float32Array;
    setParticleSleeping(index: number, sleeping: boolean): void;
    updateParticlesBatch(updates: Array<{
        particle: Entity;
        position?: Vector3;
        velocity?: Vector3;
        scale?: number;
        lifetime?: number;
        flags?: number;
    }>): void;
    resize(newCapacity: number): void;
    dispose(): void;
    getMemoryStats(): {
        bufferSize: number;
        particleCount: number;
        activeCount: number;
        sleepingCount: number;
    };
}
