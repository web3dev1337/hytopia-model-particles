import { Pattern } from './Pattern';
import type { Vector3Like } from '../types';

export class FountainPattern extends Pattern {
  public count: number = 50;
  private radius: number = 0.5;
  private height: number = 5;
  private spread: number = 30; // degrees
  private velocityMin: number = 3;
  private velocityMax: number = 6;
  
  generatePoints(): Vector3Like[] {
    const points: Vector3Like[] = [];
    
    for (let i = 0; i < this.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * this.radius;
      
      points.push({
        x: Math.cos(angle) * distance,
        y: 0,
        z: Math.sin(angle) * distance
      });
    }
    
    return points;
  }
  
  generateVelocities(): Vector3Like[] {
    const velocities: Vector3Like[] = [];
    const spreadRad = (this.spread * Math.PI) / 180;
    
    for (let i = 0; i < this.count; i++) {
      // Random angle within spread cone
      const horizontalAngle = Math.random() * Math.PI * 2;
      const verticalAngle = (Math.PI / 2) - (Math.random() * spreadRad);
      
      // Random velocity magnitude
      const velocity = this.velocityMin + Math.random() * (this.velocityMax - this.velocityMin);
      
      // Convert spherical to cartesian
      velocities.push({
        x: Math.sin(verticalAngle) * Math.cos(horizontalAngle) * velocity,
        y: Math.cos(verticalAngle) * velocity,
        z: Math.sin(verticalAngle) * Math.sin(horizontalAngle) * velocity
      });
    }
    
    return velocities;
  }
  
  applyModifiers(modifiers: Record<string, any>): void {
    if (modifiers.radius !== undefined) this.radius = modifiers.radius;
    if (modifiers.height !== undefined) this.height = modifiers.height;
    if (modifiers.spread !== undefined) this.spread = modifiers.spread;
    if (modifiers.velocityMin !== undefined) this.velocityMin = modifiers.velocityMin;
    if (modifiers.velocityMax !== undefined) this.velocityMax = modifiers.velocityMax;
    if (modifiers.count !== undefined) this.count = modifiers.count;
  }
}