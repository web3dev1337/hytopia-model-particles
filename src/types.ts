import { World, Entity } from 'hytopia';

export type Vector3Like = { x: number; y: number; z: number };

export interface ParticleConfig {
  modelUri: string;
  modelScale?: number;
  tintColor?: { r: number; g: number; b: number };
  lifetime?: number;
  mass?: number;
  friction?: number;
  bounciness?: number;
  useGravity?: boolean;
  collisionGroup?: number;
  collisionMask?: number;
}

export interface ParticleEffect {
  name: string;
  config: ParticleConfig;
  count: number;
  spread?: number;
  velocityMin?: Vector3Like;
  velocityMax?: Vector3Like;
  angularVelocityMin?: Vector3Like;
  angularVelocityMax?: Vector3Like;
  scaleVariation?: number;
  lifetimeVariation?: number;
}

export interface ParticleSystemOptions {
  maxParticles?: number;
  autoCleanup?: boolean;
  cleanupInterval?: number;
  performanceMode?: 'high' | 'balanced' | 'low';
  entityFactory?: (config: any) => Entity;
}