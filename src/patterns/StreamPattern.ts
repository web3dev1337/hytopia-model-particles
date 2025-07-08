import type { Vector3Like } from 'hytopia';
import { Pattern } from './Pattern';

export class StreamPattern extends Pattern {
  private direction: Vector3Like;

  constructor(config: any = {}, direction: Vector3Like = { x: 0, y: 1, z: 0 }) {
    super(config);
    this.direction = direction;
  }

  generatePoints(): Vector3Like[] {
    const points: Vector3Like[] = [];
    const count = this.config.count || 5;
    const spread = this.config.spread || 0.1;
    
    for (let i = 0; i < count; i++) {
      points.push({
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread
      });
    }
    
    return points;
  }

  generateVelocities(): Vector3Like[] {
    const velocities: Vector3Like[] = [];
    const count = this.config.count || 5;
    const scale = (this.config.velocityScale || 1) * 5;
    const randomness = this.config.randomness || 0.2;
    
    for (let i = 0; i < count; i++) {
      velocities.push({
        x: this.direction.x * scale + (Math.random() - 0.5) * randomness * scale,
        y: this.direction.y * scale + (Math.random() - 0.5) * randomness * scale,
        z: this.direction.z * scale + (Math.random() - 0.5) * randomness * scale
      });
    }
    
    return velocities;
  }
}