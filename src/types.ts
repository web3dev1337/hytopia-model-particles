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

// Define basic Entity interface for internal use
export interface Entity {
  id?: string;
  position: Vector3;  // Make required since it's used extensively
  velocity: Vector3;  // Make required since it's used extensively
  modelScale?: number;
  isSpawned?: boolean;
  // No index signature to avoid conflicts
}

// Define basic World interface for internal use 
export interface World {
  // No index signature to avoid conflicts
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