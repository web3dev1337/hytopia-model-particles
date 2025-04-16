import { Vector3 } from '../types';

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
  updatePositions(positions: Float32Array, startIndex: number, _count: number): void {
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

  // Resize the buffer to accommodate more particles
  resize(newCapacity: number): void {
    if (newCapacity === this.capacity) return;

    const newBuffer = new Float32Array(newCapacity * ParticleDataBuffer.FLOATS_PER_PARTICLE);
    
    // Copy existing data
    const copyLength = Math.min(this.capacity, newCapacity) * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    newBuffer.set(this.buffer.subarray(0, copyLength));
    
    this.buffer = newBuffer;
    this.capacity = newCapacity;
  }

  // Dispose of the buffer
  dispose(): void {
    this.buffer = new Float32Array(0);
    this.capacity = 0;
  }

  // Get memory usage in bytes
  getMemoryUsage(): number {
    return this.buffer.byteLength;
  }

  // Efficient batch operations using subarray views
  copyRange(sourceIndex: number, targetIndex: number, count: number): void {
    const sourceStart = sourceIndex * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    const targetStart = targetIndex * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    const length = count * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    this.buffer.copyWithin(targetStart, sourceStart, sourceStart + length);
  }

  // Batch update multiple particles at once
  updateParticles(updates: Array<{
    index: number;
    position?: Vector3;
    velocity?: Vector3;
    scale?: number;
    lifetime?: number;
    flags?: number;
  }>): void {
    for (const update of updates) {
      const baseIndex = update.index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
      if (update.position) {
        this.buffer[baseIndex] = update.position.x;
        this.buffer[baseIndex + 1] = update.position.y;
        this.buffer[baseIndex + 2] = update.position.z;
      }
      if (update.velocity) {
        this.buffer[baseIndex + 3] = update.velocity.x;
        this.buffer[baseIndex + 4] = update.velocity.y;
        this.buffer[baseIndex + 5] = update.velocity.z;
      }
      if (update.scale !== undefined) {
        this.buffer[baseIndex + 6] = update.scale;
      }
      if (update.lifetime !== undefined) {
        this.buffer[baseIndex + 7] = update.lifetime;
      }
      if (update.flags !== undefined) {
        this.buffer[baseIndex + ParticleDataBuffer.FLAGS_OFFSET] = update.flags;
      }
    }
  }

  // Get a typed view of specific attributes for all particles
  getAttributeView(attribute: 'position' | 'velocity'): Float32Array {
    const offset = attribute === 'position' ? 0 : 3;
    const length = this.capacity * 3;
    
    // Create a strided view of the buffer
    return new Float32Array(
      this.buffer.buffer,
      offset * Float32Array.BYTES_PER_ELEMENT,
      length
    );
  }
} 