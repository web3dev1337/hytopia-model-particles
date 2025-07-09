import { Vector3Like } from '../types';

/**
 * Physics forces for particles - wind, turbulence, vortex
 * Simplified version that works with Hytopia's physics API
 */
export class PhysicsForces {
  private globalWind: Vector3Like = { x: 0, y: 0, z: 0 };
  private turbulenceStrength: number = 0;
  private vortexCenters: Array<{
    position: Vector3Like;
    strength: number;
    radius: number;
    axis: Vector3Like;
  }> = [];
  
  setGlobalWind(wind: Vector3Like): void {
    this.globalWind = { ...wind };
  }
  
  setTurbulence(strength: number): void {
    this.turbulenceStrength = Math.max(0, Math.min(1, strength));
  }
  
  addVortex(position: Vector3Like, strength: number, radius: number, axis?: Vector3Like): void {
    this.vortexCenters.push({
      position: { ...position },
      strength,
      radius,
      axis: axis || { x: 0, y: 1, z: 0 } // Default to vertical vortex
    });
  }
  
  clearVortices(): void {
    this.vortexCenters = [];
  }
  
  /**
   * Calculate combined forces for a particle at a given position
   */
  calculateForces(position: Vector3Like): Vector3Like {
    const forces = { x: 0, y: 0, z: 0 };
    
    // Apply global wind
    forces.x += this.globalWind.x;
    forces.y += this.globalWind.y;
    forces.z += this.globalWind.z;
    
    // Apply turbulence (Perlin-like noise simulation)
    if (this.turbulenceStrength > 0) {
      const time = Date.now() * 0.001;
      forces.x += (Math.sin(position.x * 0.1 + time) * 0.5 + Math.sin(position.z * 0.15 + time * 1.3) * 0.5) * this.turbulenceStrength;
      forces.y += (Math.sin(position.y * 0.1 + time * 0.7) * 0.5 + Math.sin(position.x * 0.12 + time * 1.1) * 0.5) * this.turbulenceStrength * 0.5;
      forces.z += (Math.sin(position.z * 0.1 + time * 0.9) * 0.5 + Math.sin(position.y * 0.13 + time * 1.2) * 0.5) * this.turbulenceStrength;
    }
    
    // Apply vortex forces
    for (const vortex of this.vortexCenters) {
      const dx = position.x - vortex.position.x;
      const dy = position.y - vortex.position.y;
      const dz = position.z - vortex.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance < vortex.radius && distance > 0.1) {
        // Calculate tangential force for vortex
        const factor = (1 - distance / vortex.radius) * vortex.strength;
        
        // Cross product with axis to get tangential direction
        const tangent = {
          x: vortex.axis.y * dz - vortex.axis.z * dy,
          y: vortex.axis.z * dx - vortex.axis.x * dz,
          z: vortex.axis.x * dy - vortex.axis.y * dx
        };
        
        // Normalize and apply
        const tLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y + tangent.z * tangent.z);
        if (tLength > 0) {
          forces.x += (tangent.x / tLength) * factor;
          forces.y += (tangent.y / tLength) * factor;
          forces.z += (tangent.z / tLength) * factor;
          
          // Add slight inward pull
          forces.x -= dx / distance * factor * 0.2;
          forces.z -= dz / distance * factor * 0.2;
        }
      }
    }
    
    return forces;
  }
  
  /**
   * Calculate explosion force from a point
   */
  calculateExplosionForce(
    particlePos: Vector3Like, 
    explosionPos: Vector3Like, 
    strength: number,
    radius: number
  ): Vector3Like {
    const dx = particlePos.x - explosionPos.x;
    const dy = particlePos.y - explosionPos.y;
    const dz = particlePos.z - explosionPos.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance > radius || distance < 0.1) {
      return { x: 0, y: 0, z: 0 };
    }
    
    // Inverse square falloff
    const factor = strength * Math.pow(1 - distance / radius, 2);
    
    return {
      x: (dx / distance) * factor,
      y: (dy / distance) * factor + factor * 0.5, // Extra upward bias
      z: (dz / distance) * factor
    };
  }
}