import { World, ParticleEffectConfig, ParticleConfigFile, Vector3, PerformanceMetrics, CleanupStats } from './types';
export declare class ParticleEmitter {
    private world;
    private effectConfigs;
    private pools;
    private effectQueue;
    private adaptivePerformance;
    private maxParticles;
    private avgFps;
    private lastUpdateTime;
    private metrics;
    constructor(world: World, config?: string | ParticleConfigFile);
    static fromYaml(configFilePath: string, world: World): ParticleEmitter;
    private loadConfigFromFile;
    private applyConfig;
    private getDefaultConfig;
    queueEffect(effectName: string, position: Vector3, overrides?: Partial<ParticleEffectConfig>, options?: {
        priority?: number;
        maxAge?: number;
        batchKey?: string;
    }): boolean;
    private emitQueuedEffects;
    emitEffect(effectName: string, position: Vector3, overrides?: Partial<ParticleEffectConfig>): void;
    update(deltaTime: number): void;
    private updatePerformanceMetrics;
    getPerformanceMetrics(): PerformanceMetrics;
    private getTotalActiveParticles;
    getQueueStats(): {
        total: number;
        byPriority: {
            [priority: number]: number;
        };
        byEffect: {
            [effectName: string]: number;
        };
    };
    clearQueue(): void;
    setCameraPosition(position: Vector3): void;
    setWorldBounds(min: Vector3, max: Vector3): void;
    setSleepDistance(distance: number): void;
    getCleanupStats(): {
        [effectName: string]: CleanupStats;
    };
    cleanup(): void;
}
