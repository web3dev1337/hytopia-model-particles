import { Vector3, ParticleEffectConfig } from './types';
interface QueuedEffect {
    effectName: string;
    position: Vector3;
    overrides?: Partial<ParticleEffectConfig>;
    priority: number;
    timestamp: number;
    maxAge?: number;
    batchKey?: string;
}
export declare class ParticleEffectQueue {
    private queue;
    private maxQueueSize;
    private batchSize;
    private maxEffectsPerFrame;
    private defaultMaxAge;
    constructor(options?: {
        maxQueueSize?: number;
        batchSize?: number;
        maxEffectsPerFrame?: number;
        defaultMaxAge?: number;
    });
    enqueue(effectName: string, position: Vector3, overrides?: Partial<ParticleEffectConfig>, options?: {
        priority?: number;
        maxAge?: number;
        batchKey?: string;
    }): boolean;
    dequeueEffects(): QueuedEffect[];
    private pruneQueue;
    private generateBatchKey;
    clear(): void;
    getQueueLength(): number;
    getQueueStats(): {
        total: number;
        byPriority: {
            [priority: number]: number;
        };
        byEffect: {
            [effectName: string]: number;
        };
    };
}
export {};
