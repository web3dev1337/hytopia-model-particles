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

export interface ParticleEffectConfig {
  particleCount: number;           // Number of particles per effect trigger
  model?: string;                  // Model URI (e.g., a .gltf file)
  usePhysics?: boolean;           // Whether physics is enabled
  gravity?: boolean;              // Whether gravity applies (if physics is on)
  lifetime: number;               // Lifetime in seconds
  speed: SpeedConfig;             // Speed range
  direction?: { x: number; y: number; z: number } | null; // Base direction; if null, emits in all directions
  spread: number;                 // Spread angle in degrees
  size: number;                   // Scale of the particle
  pattern?: string;               // Optional key to reference a preset pattern
  patternModifiers?: {           // Optional modifiers for the pattern
    [key: string]: any;
  };
  color?: { r: number; g: number; b: number; a?: number }; // Optional color tint
  fadeOut?: boolean;             // Whether particles should fade out over lifetime
  rotationSpeed?: SpeedConfig;   // Optional rotation speed range
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
  isSpawned: boolean;
  position: Vector3;
  rawRigidBody?: any;
  modelScale?: number;
  
  spawn(
    world: World,
    position: Vector3,
    velocity: Vector3,
    lifetime: number,
    usePhysics: boolean,
    useGravity: boolean
  ): void;
  despawn(): void;
  update(deltaTime: number): void;
  setTintColor?(color: { r: number; g: number; b: number }): void;
} 