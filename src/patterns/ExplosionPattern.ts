import type { Vector3Like } from 'hytopia';
import { Pattern } from './Pattern';

export class ExplosionPattern extends Pattern {
  constructor(config: any) {
    super(config);
  }
  
  generatePoints(): Vector3Like[] {
    const points: Vector3Like[] = [];
    const count = this.count || this.config.count || 20;  // Use this.count first!
    console.log('🔍 ExplosionPattern generatePoints using:', count);
    
    for (let i = 0; i < count; i++) {
      points.push(this.sphericalRandom((this.config.spread || 1) * 0.5));
    }
    
    return points;
  }

  generateVelocities(): Vector3Like[] {
    const velocities: Vector3Like[] = [];
    const count = this.count || this.config.count || 20;  // Use this.count first!
    console.log('🔍 ExplosionPattern generateVelocities using:', count);
    // Direct velocity scale - let the caller control the exact values
    const scale = (this.config.velocityScale || 1);
    
    for (let i = 0; i < count; i++) {
      const direction = this.sphericalRandom(1);
      const speedVariation = 0.7 + Math.random() * 0.2; // 0.7 to 0.9 like current system
      const speed = scale * speedVariation;
      
      // CALCULATE STEP BY STEP TO SEE WHERE IT GOES WRONG
      const baseSpeed = speedVariation;  // 0.7 to 0.9
      const scaledSpeed = scale * speedVariation;  // should be 0.01 * (0.7-0.9) = 0.007-0.009
      const impulseScale = 0.0001;
      const finalSpeed = scaledSpeed * impulseScale;  // should be 0.000001
      
      const velocity = {
        x: direction.x * finalSpeed,
        y: direction.y * finalSpeed,
        z: direction.z * finalSpeed
      };
      
      velocities.push(velocity);
    }
    
    return velocities;
  }
}