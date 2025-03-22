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
    [key: string]: any;
}
export interface Entity {
    id: string;
    active: boolean;
    position: Vector3;
    velocity: Vector3;
    scale: number;
    model?: string;
    rigidBody?: RigidBodyOptions;
    rawRigidBody?: {
        addForce(force: Vector3): void;
        addTorque(torque: Vector3): void;
        applyImpulse(impulse: Vector3): void;
        applyImpulseAtPoint(impulse: Vector3, point: Vector3): void;
        setLinearVelocity(velocity: Vector3): void;
        getLinearVelocity(): Vector3;
        setAngularVelocity(velocity: Vector3): void;
        getAngularVelocity(): Vector3;
        setLinearDamping(damping: number): void;
        setAngularDamping(damping: number): void;
        setFixedRotation(fixed: boolean): void;
        getMass(): number;
        setSleeping(sleeping: boolean): void;
        isSleeping(): boolean;
    };
    modelScale: number;
    isSpawned: boolean;
    isSleeping: boolean;
    spawnTime: number;
    lastUpdateTime: number;
    sleepThreshold?: number;
    cleanupDelay?: number;
    spawn: (world: any, pos: Vector3, vel: Vector3, lifetime: number, physics?: any) => void;
    update: (deltaTime: number) => void;
    despawn: () => void;
    sleep?: () => void;
    wake?: () => void;
    cleanup?: () => void;
    shouldCleanup?: () => boolean;
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
