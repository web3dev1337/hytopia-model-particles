export interface SpeedConfig {
  min: number;
  max: number;
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
  // This interface will need to be updated based on the actual Hytopia SDK Entity interface
  // For now, we'll keep it as a placeholder
  [key: string]: any;
} 