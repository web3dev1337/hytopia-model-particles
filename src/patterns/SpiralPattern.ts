import { Pattern } from './Pattern';
import type { Vector3Like } from '../types';

export class SpiralPattern extends Pattern {
  public count: number = 30;
  private radius: number = 2;
  private height: number = 3;
  private rotations: number = 3;
  private velocityScale: number = 1;
  
  generatePoints(): Vector3Like[] {
    const points: Vector3Like[] = [];
    
    for (let i = 0; i < this.count; i++) {
      const t = i / (this.count - 1); // Progress from 0 to 1
      const angle = t * Math.PI * 2 * this.rotations;
      const currentRadius = t * this.radius;
      
      points.push({
        x: Math.cos(angle) * currentRadius,
        y: t * this.height,
        z: Math.sin(angle) * currentRadius
      });
    }
    
    return points;
  }
  
  generateVelocities(): Vector3Like[] {
    const velocities: Vector3Like[] = [];
    
    for (let i = 0; i < this.count; i++) {
      const t = i / (this.count - 1);
      const angle = t * Math.PI * 2 * this.rotations;
      
      // Velocity tangent to the spiral
      const tangentX = -Math.sin(angle) * this.velocityScale;
      const tangentZ = Math.cos(angle) * this.velocityScale;
      
      velocities.push({
        x: tangentX + (Math.random() - 0.5) * 0.5,
        y: 2 * this.velocityScale + Math.random(),
        z: tangentZ + (Math.random() - 0.5) * 0.5
      });
    }
    
    return velocities;
  }
  
  applyModifiers(modifiers: Record<string, any>): void {
    if (modifiers.radius !== undefined) this.radius = modifiers.radius;
    if (modifiers.height !== undefined) this.height = modifiers.height;
    if (modifiers.rotations !== undefined) this.rotations = modifiers.rotations;
    if (modifiers.velocityScale !== undefined) this.velocityScale = modifiers.velocityScale;
    if (modifiers.count !== undefined) this.count = modifiers.count;
  }
}