import { Vector3Like } from '../types';
import { Particle } from '../core/Particle';

/**
 * Spatial optimization for particles based on player distances
 * Only updates particles near players for better performance
 */
export class SpatialOptimizer {
  private updateRadius: number;
  private lodDistances: { high: number; medium: number; low: number };
  private playerPositions: Vector3Like[] = [];
  
  constructor(updateRadius: number = 50) {
    this.updateRadius = updateRadius;
    this.lodDistances = {
      high: updateRadius * 0.3,
      medium: updateRadius * 0.6,
      low: updateRadius
    };
  }
  
  setPlayerPositions(positions: Vector3Like[]): void {
    this.playerPositions = positions.map(p => ({ ...p }));
  }
  
  /**
   * Check if particle should be updated based on distance to nearest player
   */
  shouldUpdateParticle(particle: Particle): boolean {
    const particlePos = particle.position;
    if (!particlePos) return false;
    
    // If no players, update all particles
    if (this.playerPositions.length === 0) return true;
    
    // Check distance to nearest player
    let nearestDistance = Infinity;
    for (const playerPos of this.playerPositions) {
      const dx = particlePos.x - playerPos.x;
      const dy = particlePos.y - playerPos.y;
      const dz = particlePos.z - playerPos.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
      }
    }
    
    return nearestDistance <= this.updateRadius;
  }
  
  /**
   * Get LOD level for particle based on distance
   */
  getParticleLOD(particle: Particle): 'high' | 'medium' | 'low' | 'skip' {
    const particlePos = particle.position;
    if (!particlePos) return 'skip';
    
    if (this.playerPositions.length === 0) return 'high';
    
    let nearestDistance = Infinity;
    for (const playerPos of this.playerPositions) {
      const dx = particlePos.x - playerPos.x;
      const dy = particlePos.y - playerPos.y;
      const dz = particlePos.z - playerPos.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
      }
    }
    
    if (nearestDistance <= this.lodDistances.high) return 'high';
    if (nearestDistance <= this.lodDistances.medium) return 'medium';
    if (nearestDistance <= this.lodDistances.low) return 'low';
    return 'skip';
  }
  
  /**
   * Get update frequency based on LOD
   */
  getUpdateFrequency(lod: 'high' | 'medium' | 'low' | 'skip'): number {
    switch (lod) {
      case 'high': return 1; // Every frame
      case 'medium': return 3; // Every 3 frames
      case 'low': return 5; // Every 5 frames
      case 'skip': return 0; // Never
    }
  }
}