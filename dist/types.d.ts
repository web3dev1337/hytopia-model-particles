import { Entity } from 'hytopia';
export type Vector3Like = {
    x: number;
    y: number;
    z: number;
};
export type ColorLike = {
    r: number;
    g: number;
    b: number;
};
export interface AnimationCurve {
    type: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'curve';
    keyframes?: {
        time: number;
        value: number;
    }[];
}
export interface ColorGradient {
    type: 'linear' | 'smooth';
    keyframes: {
        time: number;
        color: ColorLike;
    }[];
}
export interface ParticleAnimations {
    scaleOverTime?: {
        start: number;
        end: number;
        curve?: AnimationCurve;
    };
    colorOverTime?: ColorGradient;
    opacityOverTime?: {
        start: number;
        end: number;
        curve?: AnimationCurve;
    };
    rotationOverTime?: {
        velocity: number;
        acceleration?: number;
    };
}
export interface ParticleConfig {
    modelUri: string;
    modelScale?: number | {
        start: number;
        end: number;
    };
    tintColor?: ColorLike | ColorGradient;
    lifetime?: number;
    mass?: number;
    friction?: number;
    bounciness?: number;
    useGravity?: boolean;
    gravityScale?: number;
    collisionGroup?: number;
    collisionMask?: number;
    animations?: ParticleAnimations;
    opacity?: number | {
        start: number;
        end: number;
    };
    rotation?: {
        min: number;
        max: number;
        velocity?: number;
    };
}
export interface ParticleEffect {
    name: string;
    extends?: string;
    config: ParticleConfig;
    count: number;
    spread?: number;
    velocityMin?: Vector3Like;
    velocityMax?: Vector3Like;
    angularVelocityMin?: Vector3Like;
    angularVelocityMax?: Vector3Like;
    scaleVariation?: number;
    lifetimeVariation?: number;
    pattern?: string;
    patternModifiers?: Record<string, any>;
}
export interface PerformanceMetrics {
    currentFPS: number;
    averageFPS: number;
    particleCount: number;
    poolSize: number;
    qualityLevel: 'high' | 'medium' | 'low';
    droppedFrames: number;
    lastFrameTime: number;
    poolStats?: {
        available: number;
        active: number;
        totalCreated: number;
        poolEfficiency: number;
    };
    bufferStats?: {
        capacity: number;
        used: number;
        utilization: number;
    };
}
export interface PerformanceOptions {
    enableAdaptiveQuality?: boolean;
    targetFPS?: number;
    qualityLevels?: {
        high: {
            maxParticles: number;
            particleScale?: number;
        };
        medium: {
            maxParticles: number;
            particleScale?: number;
        };
        low: {
            maxParticles: number;
            particleScale?: number;
        };
    };
    monitoringInterval?: number;
    enablePooling?: boolean;
    enableSpatialOptimization?: boolean;
    updateRadius?: number;
}
export interface PhysicsOptions {
    globalWind?: Vector3Like;
    turbulence?: number;
    enableForces?: boolean;
}
export interface ParticleSystemOptions {
    maxParticles?: number;
    autoCleanup?: boolean;
    cleanupInterval?: number;
    performanceMode?: 'high' | 'balanced' | 'low';
    entityFactory?: (config: any) => Entity;
    performance?: PerformanceOptions;
    physics?: PhysicsOptions;
    poolSize?: number;
    configPath?: string;
    enableHotReload?: boolean;
    debug?: boolean;
}
export interface QueuedEffect {
    effectName: string;
    position: Vector3Like;
    options?: any;
    priority: number;
    timestamp: number;
}
//# sourceMappingURL=types.d.ts.map