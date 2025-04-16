import { Vector3, Entity } from '../types';

interface GridCell {
  particles: Set<Entity>;
}

export class SpatialGrid {
  private cells: Map<string, GridCell>;
  private cellSize: number;

  constructor(cellSize = 10) {
    this.cells = new Map();
    this.cellSize = cellSize;
  }

  private getCellKey(position: Vector3): string {
    const x = Math.floor(position.x / this.cellSize);
    const y = Math.floor(position.y / this.cellSize);
    const z = Math.floor(position.z / this.cellSize);
    return `${x},${y},${z}`;
  }

  private getOrCreateCell(key: string): GridCell {
    let cell = this.cells.get(key);
    if (!cell) {
      cell = { particles: new Set() };
      this.cells.set(key, cell);
    }
    return cell;
  }

  updateParticlePosition(particle: Entity, oldPosition?: Vector3): void {
    if (oldPosition) {
      const oldKey = this.getCellKey(oldPosition);
      const oldCell = this.cells.get(oldKey);
      if (oldCell) {
        oldCell.particles.delete(particle);
        if (oldCell.particles.size === 0) {
          this.cells.delete(oldKey);
        }
      }
    }

    const newKey = this.getCellKey(particle.position);
    const cell = this.getOrCreateCell(newKey);
    cell.particles.add(particle);
  }

  removeParticle(particle: Entity): void {
    const key = this.getCellKey(particle.position);
    const cell = this.cells.get(key);
    if (cell) {
      cell.particles.delete(particle);
      if (cell.particles.size === 0) {
        this.cells.delete(key);
      }
    }
  }

  getNearbyParticles(position: Vector3, radius: number): Entity[] {
    const radiusCells = Math.ceil(radius / this.cellSize);
    const centerCell = {
      x: Math.floor(position.x / this.cellSize),
      y: Math.floor(position.y / this.cellSize),
      z: Math.floor(position.z / this.cellSize)
    };
    
    const nearbyParticles: Entity[] = [];
    const radiusSquared = radius * radius;

    // Check all cells within the radius
    for (let x = -radiusCells; x <= radiusCells; x++) {
      for (let y = -radiusCells; y <= radiusCells; y++) {
        for (let z = -radiusCells; z <= radiusCells; z++) {
          const key = `${centerCell.x + x},${centerCell.y + y},${centerCell.z + z}`;
          const cell = this.cells.get(key);
          
          if (cell) {
            for (const particle of cell.particles) {
              const dx = particle.position.x - position.x;
              const dy = particle.position.y - position.y;
              const dz = particle.position.z - position.z;
              const distanceSquared = dx * dx + dy * dy + dz * dz;
              
              if (distanceSquared <= radiusSquared) {
                nearbyParticles.push(particle);
              }
            }
          }
        }
      }
    }

    return nearbyParticles;
  }

  getParticlesInBounds(min: Vector3, max: Vector3): Entity[] {
    const minCell = {
      x: Math.floor(min.x / this.cellSize),
      y: Math.floor(min.y / this.cellSize),
      z: Math.floor(min.z / this.cellSize)
    };
    
    const maxCell = {
      x: Math.floor(max.x / this.cellSize),
      y: Math.floor(max.y / this.cellSize),
      z: Math.floor(max.z / this.cellSize)
    };

    const particles: Entity[] = [];

    for (let x = minCell.x; x <= maxCell.x; x++) {
      for (let y = minCell.y; y <= maxCell.y; y++) {
        for (let z = minCell.z; z <= maxCell.z; z++) {
          const key = `${x},${y},${z}`;
          const cell = this.cells.get(key);
          
          if (cell) {
            for (const particle of cell.particles) {
              if (particle.position.x >= min.x && particle.position.x <= max.x &&
                  particle.position.y >= min.y && particle.position.y <= max.y &&
                  particle.position.z >= min.z && particle.position.z <= max.z) {
                particles.push(particle);
              }
            }
          }
        }
      }
    }

    return particles;
  }

  clear(): void {
    this.cells.clear();
  }

  getCellCount(): number {
    return this.cells.size;
  }

  getTotalParticleCount(): number {
    let count = 0;
    for (const cell of this.cells.values()) {
      count += cell.particles.size;
    }
    return count;
  }
} 