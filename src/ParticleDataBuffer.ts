import { Vector3 } from './types';

export class ParticleDataBuffer {
  // Position (x,y,z), Velocity (x,y,z), Scale, LifeTime, Flags
  private static readonly FLOATS_PER_PARTICLE = 9;
  private static readonly FLAGS_OFFSET = 8;

  private buffer: Float32Array;
  private capacity: number;

  constructor(maxParticles: number) {
    this.capacity = maxParticles;
    this.buffer = new Float32Array(maxParticles * ParticleDataBuffer.FLOATS_PER_PARTICLE);
  }

  setPosition(index: number, position: Vector3): void {
    const baseIndex = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    this.buffer[baseIndex] = position.x;
    this.buffer[baseIndex + 1] = position.y;
    this.buffer[baseIndex + 2] = position.z;
  }

  setVelocity(index: number, velocity: Vector3): void {
    const baseIndex = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    this.buffer[baseIndex + 3] = velocity.x;
    this.buffer[baseIndex + 4] = velocity.y;
    this.buffer[baseIndex + 5] = velocity.z;
  }

  setScale(index: number, scale: number): void {
    const baseIndex = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    this.buffer[baseIndex + 6] = scale;
  }

  setLifetime(index: number, lifetime: number): void {
    const baseIndex = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    this.buffer[baseIndex + 7] = lifetime;
  }

  setFlags(index: number, flags: number): void {
    const baseIndex = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    this.buffer[baseIndex + ParticleDataBuffer.FLAGS_OFFSET] = flags;
  }

  getPosition(index: number): Vector3 {
    const baseIndex = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    return {
      x: this.buffer[baseIndex],
      y: this.buffer[baseIndex + 1],
      z: this.buffer[baseIndex + 2]
    };
  }

  getVelocity(index: number): Vector3 {
    const baseIndex = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    return {
      x: this.buffer[baseIndex + 3],
      y: this.buffer[baseIndex + 4],
      z: this.buffer[baseIndex + 5]
    };
  }

  getScale(index: number): number {
    const baseIndex = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    return this.buffer[baseIndex + 6];
  }

  getLifetime(index: number): number {
    const baseIndex = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    return this.buffer[baseIndex + 7];
  }

  getFlags(index: number): number {
    const baseIndex = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    return this.buffer[baseIndex + ParticleDataBuffer.FLAGS_OFFSET];
  }

  // Efficient batch updates
  updatePositions(positions: Float32Array, startIndex: number, count: number): void {
    const targetStart = startIndex * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    this.buffer.set(positions, targetStart);
  }

  // Get raw buffer for efficient rendering
  getRawBuffer(): Float32Array {
    return this.buffer;
  }

  // Get a view of the position data for efficient rendering
  getPositionBuffer(): Float32Array {
    return new Float32Array(
      this.buffer.buffer,
      0,
      this.capacity * 3
    );
  }

  clear(): void {
    this.buffer.fill(0);
  }

  getCapacity(): number {
    return this.capacity;
  }
} 