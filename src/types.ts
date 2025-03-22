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
  restitution?: number;      // Bounciness (0-1)
  friction?: number;         // Surface friction (0-1)
  density?: number;         // Material density for mass calculation
}

export interface CollisionFilter {
  group?: number;           // Collision group (-32 to 32)
  mask?: number;           // Collision mask (bitmask)
  category?: number;       // Collision category (bitmask)
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
    size: Vector3;         // Dimensions for box/cylinder, or radius for sphere
    offset?: Vector3;      // Offset from entity center
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
  particleCount: number;           // Number of particles per effect trigger
  model?: string;                  // Model URI (e.g., a .gltf file)
  lifetime: number;               // Lifetime in seconds
  speed: SpeedConfig;             // Speed range
  direction?: Vector3 | null;       // Base direction; if null, emits in all directions
  spread: number;                 // Spread angle in degrees
  size: number;                   // Scale of the particle
  pattern?: string;               // Optional key to reference a preset pattern
  patternModifiers?: {           // Optional modifiers for the pattern
    [key: string]: any;
  };
  physics?: PhysicsConfig;          // Replace usePhysics and gravity with detailed config
  color?: { r: number; g: number; b: number; a?: number }; // Optional color tint
  fadeOut?: boolean;             // Whether particles should fade out over lifetime
  rotationSpeed?: SpeedConfig;     // Optional rotation speed range
  scaleOverTime?: {             // Optional scale modification over lifetime
    start: number;
    end: number;
  };
}

export interface ParticleConfigFile {
  effects: { [effectName: string]: ParticleEffectConfig };
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
  // This interface will need to be updated based on the actual Hytopia SDK World interface
  // For now, we'll keep it as a placeholder
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