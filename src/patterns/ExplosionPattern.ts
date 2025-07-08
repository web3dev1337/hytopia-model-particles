import type { Vector3Like } from 'hytopia';
import { Pattern } from './Pattern';

export class ExplosionPattern extends Pattern {
  generatePoints(): Vector3Like[] {
    const points: Vector3Like[] = [];
    const count = this.config.count || 20;
    
    for (let i = 0; i < count; i++) {
      points.push(this.sphericalRandom((this.config.spread || 1) * 0.5));
    }
    
    return points;
  }

  generateVelocities(): Vector3Like[] {
    const velocities: Vector3Like[] = [];
    const count = this.config.count || 20;
    const scale = (this.config.velocityScale || 1) * 10;
    
    for (let i = 0; i < count; i++) {
      const direction = this.sphericalRandom(1);
      const speed = scale * (0.5 + Math.random() * 0.5);
      
      velocities.push({
        x: direction.x * speed,
        y: direction.y * speed + scale * 0.5, // Add upward bias
        z: direction.z * speed
      });
    }
    
    return velocities;
  }
}