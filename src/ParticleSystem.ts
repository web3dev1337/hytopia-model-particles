import { World, Entity } from 'hytopia';
import type { Vector3Like } from 'hytopia';
import { Particle } from './Particle';
import { ParticleConfig, ParticleEffect, ParticleSystemOptions } from './types';
import { Pattern } from './patterns/Pattern';
import { ExplosionPattern } from './patterns/ExplosionPattern';
import { StreamPattern } from './patterns/StreamPattern';

export class ParticleSystem {
  private world: World;
  private particles: Particle[] = [];
  private activeParticles: Set<Particle> = new Set();
  private maxParticles: number;
  private lastCleanup: number = 0;
  private cleanupInterval: number;
  private effects: Map<string, ParticleEffect> = new Map();
  private patterns: Map<string, Pattern> = new Map();
  private entityFactory?: (config: any) => Entity;

  constructor(world: World, options: ParticleSystemOptions = {}) {
    this.world = world;
    this.maxParticles = options.maxParticles || 500;
    this.cleanupInterval = options.cleanupInterval || 1000;
    this.entityFactory = options.entityFactory;
    
    // Register default patterns
    this.registerPattern('explosion', new ExplosionPattern());
    this.registerPattern('stream', new StreamPattern());
    
    // Start cleanup loop if enabled
    if (options.autoCleanup !== false) {
      this.startCleanupLoop();
    }
  }

  registerEffect(effect: ParticleEffect): void {
    this.effects.set(effect.name, effect);
  }

  registerPattern(name: string, pattern: Pattern): void {
    this.patterns.set(name, pattern);
  }

  spawn(effectName: string, position: Vector3Like, options: any = {}): void {
    const effect = this.effects.get(effectName);
    if (!effect) {
      console.warn(`Particle effect '${effectName}' not found`);
      return;
    }
    
    this.spawnEffect(effect, position, options);
  }

  spawnWithPattern(
    patternName: string, 
    config: ParticleConfig, 
    position: Vector3Like, 
    modifiers: Record<string, any> = {}
  ): void {
    const pattern = this.patterns.get(patternName);
    if (!pattern) {
      console.warn(`Pattern '${patternName}' not found`);
      return;
    }
    
    // Apply modifiers to pattern
    pattern.applyModifiers(modifiers);
    
    const points = pattern.generatePoints();
    const velocities = pattern.generateVelocities();
    
    for (let i = 0; i < points.length; i++) {
      const particle = this.getOrCreateParticle(config);
      if (!particle) break;
      
      const spawnPos = {
        x: position.x + points[i].x,
        y: position.y + points[i].y,
        z: position.z + points[i].z
      };
      
      particle.spawn(this.world, spawnPos, velocities[i]);
      this.activeParticles.add(particle);
    }
  }

  private spawnEffect(effect: ParticleEffect, position: Vector3Like, options: any): void {
    const count = options.count || effect.count;
    const spread = options.spread || effect.spread || 1;
    
    for (let i = 0; i < count; i++) {
      const particle = this.getOrCreateParticle(effect.config);
      if (!particle) break;
      
      // Calculate spawn position with spread
      const offset = {
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread
      };
      
      const spawnPos = {
        x: position.x + offset.x,
        y: position.y + offset.y,
        z: position.z + offset.z
      };
      
      // Calculate velocity
      let velocity: Vector3Like | undefined;
      if (effect.velocityMin && effect.velocityMax) {
        velocity = {
          x: effect.velocityMin.x + Math.random() * (effect.velocityMax.x - effect.velocityMin.x),
          y: effect.velocityMin.y + Math.random() * (effect.velocityMax.y - effect.velocityMin.y),
          z: effect.velocityMin.z + Math.random() * (effect.velocityMax.z - effect.velocityMin.z)
        };
      }
      
      // Calculate angular velocity
      let angularVelocity: Vector3Like | undefined;
      if (effect.angularVelocityMin && effect.angularVelocityMax) {
        angularVelocity = {
          x: effect.angularVelocityMin.x + Math.random() * (effect.angularVelocityMax.x - effect.angularVelocityMin.x),
          y: effect.angularVelocityMin.y + Math.random() * (effect.angularVelocityMax.y - effect.angularVelocityMin.y),
          z: effect.angularVelocityMin.z + Math.random() * (effect.angularVelocityMax.z - effect.angularVelocityMin.z)
        };
      }
      
      particle.spawn(this.world, spawnPos, velocity, angularVelocity);
      this.activeParticles.add(particle);
    }
  }

  private getOrCreateParticle(config: ParticleConfig): Particle | null {
    // Try to reuse inactive particle
    for (const particle of this.particles) {
      if (!particle.active) {
        particle.reset(config);
        return particle;
      }
    }
    
    // Create new particle if under limit
    if (this.particles.length < this.maxParticles) {
      const particle = new Particle(config, this.entityFactory);
      this.particles.push(particle);
      return particle;
    }
    
    return null;
  }

  update(): void {
    const now = Date.now();
    
    // Update active particles
    for (const particle of this.activeParticles) {
      if (!particle.update()) {
        this.activeParticles.delete(particle);
      }
    }
    
    // Periodic cleanup
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  private cleanup(): void {
    // Remove completely inactive particles that haven't been used in a while
    if (this.particles.length > this.maxParticles * 0.8) {
      const inactiveCount = this.particles.filter(p => !p.active).length;
      if (inactiveCount > this.maxParticles * 0.3) {
        // Remove some inactive particles
        this.particles = this.particles.filter(p => p.active || Math.random() > 0.5);
      }
    }
  }

  private startCleanupLoop(): void {
    setInterval(() => this.update(), 16); // ~60fps update rate
  }

  despawnAll(): void {
    for (const particle of this.activeParticles) {
      particle.despawn();
    }
    this.activeParticles.clear();
  }

  get activeCount(): number {
    return this.activeParticles.size;
  }
}