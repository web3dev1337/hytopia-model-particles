import { Vector3 } from './types';
export declare class ParticleDataBuffer {
    private static readonly FLOATS_PER_PARTICLE;
    private static readonly FLAGS_OFFSET;
    private buffer;
    private capacity;
    constructor(maxParticles: number);
    setPosition(index: number, position: Vector3): void;
    setVelocity(index: number, velocity: Vector3): void;
    setScale(index: number, scale: number): void;
    setLifetime(index: number, lifetime: number): void;
    setFlags(index: number, flags: number): void;
    getPosition(index: number): Vector3;
    getVelocity(index: number): Vector3;
    getScale(index: number): number;
    getLifetime(index: number): number;
    getFlags(index: number): number;
    updatePositions(positions: Float32Array, startIndex: number, count: number): void;
    getRawBuffer(): Float32Array;
    getPositionBuffer(): Float32Array;
    clear(): void;
    getCapacity(): number;
    resize(newCapacity: number): void;
    dispose(): void;
    getMemoryUsage(): number;
    copyRange(sourceIndex: number, targetIndex: number, count: number): void;
    updateParticles(updates: Array<{
        index: number;
        position?: Vector3;
        velocity?: Vector3;
        scale?: number;
        lifetime?: number;
        flags?: number;
    }>): void;
    getAttributeView(attribute: 'position' | 'velocity'): Float32Array;
}
