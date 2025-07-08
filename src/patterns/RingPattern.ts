import { Pattern } from './Pattern';
import type { Vector3Like } from '../types';

export class RingPattern extends Pattern {
  public count: number = 30;
  private radius: number = 2;
  private expansionSpeed: number = 3;
  private rings: number = 1;
  private height: number = 0;
  private wobble: number = 0;
  
  generatePoints(): Vector3Like[] {
    const points: Vector3Like[] = [];
    const particlesPerRing = Math.floor(this.count / this.rings);
    
    for (let ring = 0; ring < this.rings; ring++) {
      const ringRadius = this.radius * (ring + 1) / this.rings;
      
      for (let i = 0; i < particlesPerRing; i++) {
        const angle = (i / particlesPerRing) * Math.PI * 2;
        const wobbleOffset = this.wobble * Math.sin(angle * 3) * Math.random();
        
        points.push({
          x: Math.cos(angle) * (ringRadius + wobbleOffset),
          y: this.height + (Math.random() - 0.5) * 0.2,
          z: Math.sin(angle) * (ringRadius + wobbleOffset)
        });
      }
    }
    
    return points;
  }
  
  generateVelocities(): Vector3Like[] {
    const velocities: Vector3Like[] = [];
    const particlesPerRing = Math.floor(this.count / this.rings);
    
    for (let ring = 0; ring < this.rings; ring++) {
      for (let i = 0; i < particlesPerRing; i++) {
        const angle = (i / particlesPerRing) * Math.PI * 2;
        
        // Radial expansion
        velocities.push({
          x: Math.cos(angle) * this.expansionSpeed,
          y: (Math.random() - 0.5) * 0.5,
          z: Math.sin(angle) * this.expansionSpeed
        });
      }
    }
    
    return velocities;
  }
  
  applyModifiers(modifiers: Record<string, any>): void {
    if (modifiers.radius !== undefined) this.radius = modifiers.radius;
    if (modifiers.expansionSpeed !== undefined) this.expansionSpeed = modifiers.expansionSpeed;
    if (modifiers.rings !== undefined) this.rings = modifiers.rings;
    if (modifiers.height !== undefined) this.height = modifiers.height;
    if (modifiers.wobble !== undefined) this.wobble = modifiers.wobble;
    if (modifiers.count !== undefined) this.count = modifiers.count;
  }
}