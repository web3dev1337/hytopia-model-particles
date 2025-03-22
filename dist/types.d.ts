export interface SpeedConfig {
    min: number;
    max: number;
}
export interface PerformanceMetrics {
    lastFrameTime: number;
    frameCount: number;
    averageFrameTime: number;
    particleReductionFactor: number;
    activeParticleCount: number;
    poolSize: number;
    fpsHistory: number[];
    droppedFrames: number;
}
export interface BasePattern {
    name: string;
    description?: string;
    defaultConfig: ParticleEffectConfig;
    modifiers?: {
        [key: string]: (config: ParticleEffectConfig, value: any) => ParticleEffectConfig;
    };
}
export interface PhysicsMaterial {
    restitution?: number;
    friction?: number;
    density?: number;
}
export interface CollisionFilter {
    group?: number;
    mask?: number;
    category?: number;
}
export interface RigidBodyOptions {
    type: 'dynamic' | 'static' | 'kinematic';
    mass?: number;
    useGravity?: boolean;
    gravityScale?: number;
    linearDamping?: number;
    angularDamping?: number;
    fixedRotation?: boolean;
    material?: PhysicsMaterial;
    colliders?: Array<{
        shape: 'sphere' | 'box' | 'cylinder';
        size: Vector3;
        offset?: Vector3;
        isTrigger?: boolean;
        material?: PhysicsMaterial;
    }>;
}
export interface PhysicsConfig {
    enabled: boolean;
    rigidBody?: RigidBodyOptions;
    forces?: {
        wind?: {
            direction: Vector3;
            strength: number;
            turbulence?: number;
        };
        vortex?: {
            center: Vector3;
            strength: number;
            radius: number;
        };
    };
}
export interface ParticleEffectConfig {
    particleCount: number;
    model?: string;
    lifetime: number;
    speed: SpeedConfig;
    direction?: Vector3 | null;
    spread: number;
    size: number;
    pattern?: string;
    patternModifiers?: {
        [key: string]: any;
    };
    physics?: PhysicsConfig;
    color?: {
        r: number;
        g: number;
        b: number;
        a?: number;
    };
    fadeOut?: boolean;
    rotationSpeed?: SpeedConfig;
    scaleOverTime?: {
        start: number;
        end: number;
    };
}
export interface ParticleConfigFile {
    effects: {
        [effectName: string]: ParticleEffectConfig;
    };
    global?: {
        adaptivePerformance?: boolean;
        maxParticles?: number;
        poolOptions?: {
            cellSize?: number;
            sleepDistance?: number;
            cleanupCheckInterval?: number;
            bounds?: {
                min: Vector3;
                max: Vector3;
            };
        };
    };
}
export type ParticlePatternFunction = (overrides?: Partial<ParticleEffectConfig>) => ParticleEffectConfig;
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}
export interface World {
    createEntity: (options: any) => any;
    emit?: (event: string, data: any) => void;
    simulation?: any;
    [key: string]: any;
}
export interface Entity {
    id?: string | number;
    position: Vector3;
    velocity?: Vector3;
    scale?: Vector3;
    modelScale?: number;
    isSpawned?: boolean;
    model?: any;
    rigidBody?: any;
    rawRigidBody?: any;
    [key: string]: any;
}
export interface CleanupStats {
    totalCleaned: number;
    byReason: {
        expired: number;
        outOfBounds: number;
        manual: number;
        error: number;
    };
    memoryReclaimed?: number;
}
