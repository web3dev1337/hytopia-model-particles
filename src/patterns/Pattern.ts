import type { Vector3Like } from 'hytopia';

export interface PatternConfig {
  spread?: number;
  count?: number;
  velocityScale?: number;
  randomness?: number;
}

export abstract class Pattern {
  protected config: PatternConfig;
  public count: number = 10;

  constructor(config: PatternConfig = {}) {
    this.config = {
      spread: 1,
      count: 10,
      velocityScale: 1,
      randomness: 0.5,
      ...config
    };
    this.count = this.config.count || 10;
  }

  abstract generatePoints(): Vector3Like[];
  abstract generateVelocities(): Vector3Like[];

  /**
   * Generate particles for v2.2 compatibility
   */
  generate(
    config: any,
    position: Vector3Like,
    count: number,
    options?: any
  ): Array<{
    config: any;
    position: Vector3Like;
    velocity?: Vector3Like;
    angularVelocity?: Vector3Like;
  }> {
    
    this.count = count;
    if (options) {
      this.applyModifiers(options);
    }
    
    const points = this.generatePoints();
    const velocities = this.generateVelocities();
    
    const result = points.map((point, i) => ({
      config,
      position: {
        x: position.x + point.x,
        y: position.y + point.y,
        z: position.z + point.z
      },
      velocity: velocities[i],
      angularVelocity: this.generateAngularVelocity ? this.generateAngularVelocity() : undefined
    }));
    
    
    return result;
  }
  
  protected generateAngularVelocity?(): Vector3Like;

  protected randomVector3(scale: number = 1): Vector3Like {
    return {
      x: (Math.random() - 0.5) * scale,
      y: (Math.random() - 0.5) * scale,
      z: (Math.random() - 0.5) * scale
    };
  }

  protected sphericalRandom(radius: number): Vector3Like {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());
    
    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi)
    };
  }

  applyModifiers(modifiers: Record<string, any>): void {
    if (modifiers.intensity) {
      this.config.count = Math.floor((this.config.count || 10) * modifiers.intensity);
    }
    if (modifiers.spread) {
      this.config.spread = (this.config.spread || 1) * modifiers.spread;
    }
    if (modifiers.velocity) {
      this.config.velocityScale = (this.config.velocityScale || 1) * modifiers.velocity;
    }
  }
}