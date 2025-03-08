import { Vector3, Entity } from './types';
export declare class SpatialGrid {
    private cells;
    private cellSize;
    constructor(cellSize?: number);
    private getCellKey;
    private getOrCreateCell;
    updateParticlePosition(particle: Entity, oldPosition?: Vector3): void;
    removeParticle(particle: Entity): void;
    getNearbyParticles(position: Vector3, radius: number): Entity[];
    getParticlesInBounds(min: Vector3, max: Vector3): Entity[];
    clear(): void;
    getCellCount(): number;
    getTotalParticleCount(): number;
}
