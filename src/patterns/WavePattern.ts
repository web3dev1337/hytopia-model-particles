import { Pattern } from './Pattern';
import type { Vector3Like } from '../types';

export class WavePattern extends Pattern {
  public count: number = 40;
  private wavelength: number = 4;
  private amplitude: number = 1;
  private spread: number = 3;
  private waves: number = 2;
  private velocityScale: number = 1;
  
  generatePoints(): Vector3Like[] {
    const points: Vector3Like[] = [];
    
    for (let i = 0; i < this.count; i++) {
      const t = i / (this.count - 1);
      const x = (t - 0.5) * this.spread;
      const waveProgress = t * this.waves * Math.PI * 2;
      const y = Math.sin(waveProgress) * this.amplitude;
      
      points.push({
        x: x,
        y: y + 1, // Offset up slightly
        z: (Math.random() - 0.5) * 0.5 // Small random Z spread
      });
    }
    
    return points;
  }
  
  generateVelocities(): Vector3Like[] {
    const velocities: Vector3Like[] = [];
    
    for (let i = 0; i < this.count; i++) {
      const t = i / (this.count - 1);
      const waveProgress = t * this.waves * Math.PI * 2;
      
      // Velocity follows wave derivative
      const yVelocity = Math.cos(waveProgress) * this.amplitude * this.velocityScale;
      
      velocities.push({
        x: (t - 0.5) * this.velocityScale,
        y: yVelocity + 1,
        z: (Math.random() - 0.5) * 0.5
      });
    }
    
    return velocities;
  }
  
  applyModifiers(modifiers: Record<string, any>): void {
    if (modifiers.wavelength !== undefined) this.wavelength = modifiers.wavelength;
    if (modifiers.amplitude !== undefined) this.amplitude = modifiers.amplitude;
    if (modifiers.spread !== undefined) this.spread = modifiers.spread;
    if (modifiers.waves !== undefined) this.waves = modifiers.waves;
    if (modifiers.velocityScale !== undefined) this.velocityScale = modifiers.velocityScale;
    if (modifiers.count !== undefined) this.count = modifiers.count;
  }
}