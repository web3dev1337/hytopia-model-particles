import { Entity, Vector3, CleanupStats } from './types';
interface BoundingBox {
    min: Vector3;
    max: Vector3;
}
export declare class ParticleLifecycleManager {
    private cleanupStats;
    private bounds?;
    private sleepDistance;
    private cleanupCheckInterval;
    private lastCleanupCheck;
    private defaultSleepThreshold;
    private defaultCleanupDelay;
    constructor(options?: {
        bounds?: BoundingBox;
        sleepDistance?: number;
        cleanupCheckInterval?: number;
        defaultSleepThreshold?: number;
        defaultCleanupDelay?: number;
    });
    update(particles: Entity[], cameraPosition: Vector3, deltaTime: number): void;
    private shouldSleep;
    private shouldWake;
    private sleepParticle;
    private wakeParticle;
    shouldCleanup(particle: Entity, currentTime: number): boolean;
    private isOutOfBounds;
    cleanupParticle(particle: Entity, reason: keyof CleanupStats['byReason']): void;
    private performCleanup;
    setBounds(bounds: BoundingBox): void;
    setSleepDistance(distance: number): void;
    getCleanupStats(): CleanupStats;
    resetCleanupStats(): void;
}
export {};
