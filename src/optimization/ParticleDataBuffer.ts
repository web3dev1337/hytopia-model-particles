/**
 * Efficient TypedArray buffer for particle metadata
 * Stores particle data in Float32Arrays for better performance
 */
export class ParticleDataBuffer {
  // Each particle uses 12 floats:
  // 0-2: velocity (x,y,z)
  // 3-5: angular velocity (x,y,z)
  // 6: lifetime progress
  // 7: custom data 1
  // 8: custom data 2
  // 9: custom data 3
  // 10: LOD update counter
  // 11: flags (active, physics enabled, etc.)
  
  private static readonly FLOATS_PER_PARTICLE = 12;
  private buffer: Float32Array;
  private capacity: number;
  private freeIndices: number[] = [];
  private usedIndices: Set<number> = new Set();
  
  constructor(capacity: number = 1000) {
    this.capacity = capacity;
    this.buffer = new Float32Array(capacity * ParticleDataBuffer.FLOATS_PER_PARTICLE);
    
    // Initialize free indices
    for (let i = capacity - 1; i >= 0; i--) {
      this.freeIndices.push(i);
    }
  }
  
  allocate(): number {
    const index = this.freeIndices.pop();
    if (index !== undefined) {
      this.usedIndices.add(index);
      this.clearData(index);
      return index;
    }
    return -1; // Buffer full
  }
  
  release(index: number): void {
    if (this.usedIndices.has(index)) {
      this.usedIndices.delete(index);
      this.freeIndices.push(index);
      this.clearData(index);
    }
  }
  
  private clearData(index: number): void {
    const offset = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    for (let i = 0; i < ParticleDataBuffer.FLOATS_PER_PARTICLE; i++) {
      this.buffer[offset + i] = 0;
    }
  }
  
  // Velocity accessors
  setVelocity(index: number, x: number, y: number, z: number): void {
    const offset = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    this.buffer[offset] = x;
    this.buffer[offset + 1] = y;
    this.buffer[offset + 2] = z;
  }
  
  getVelocity(index: number): { x: number; y: number; z: number } {
    const offset = index * ParticleDataBuffer.FLOATS_PER_PARTICLE;
    return {
      x: this.buffer[offset],
      y: this.buffer[offset + 1],
      z: this.buffer[offset + 2]
    };
  }
  
  // Angular velocity accessors
  setAngularVelocity(index: number, x: number, y: number, z: number): void {
    const offset = index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 3;
    this.buffer[offset] = x;
    this.buffer[offset + 1] = y;
    this.buffer[offset + 2] = z;
  }
  
  getAngularVelocity(index: number): { x: number; y: number; z: number } {
    const offset = index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 3;
    return {
      x: this.buffer[offset],
      y: this.buffer[offset + 1],
      z: this.buffer[offset + 2]
    };
  }
  
  // Lifetime progress
  setLifetimeProgress(index: number, progress: number): void {
    this.buffer[index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 6] = progress;
  }
  
  getLifetimeProgress(index: number): number {
    return this.buffer[index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 6];
  }
  
  // Custom data slots
  setCustomData(index: number, slot: 0 | 1 | 2, value: number): void {
    this.buffer[index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 7 + slot] = value;
  }
  
  getCustomData(index: number, slot: 0 | 1 | 2): number {
    return this.buffer[index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 7 + slot];
  }
  
  // LOD update counter
  setUpdateCounter(index: number, counter: number): void {
    this.buffer[index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 10] = counter;
  }
  
  getUpdateCounter(index: number): number {
    return this.buffer[index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 10];
  }
  
  incrementUpdateCounter(index: number): number {
    const offset = index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 10;
    return ++this.buffer[offset];
  }
  
  // Flags
  setFlag(index: number, flag: number, enabled: boolean): void {
    const offset = index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 11;
    if (enabled) {
      this.buffer[offset] |= flag;
    } else {
      this.buffer[offset] &= ~flag;
    }
  }
  
  getFlag(index: number, flag: number): boolean {
    return (this.buffer[index * ParticleDataBuffer.FLOATS_PER_PARTICLE + 11] & flag) !== 0;
  }
  
  getStats() {
    return {
      capacity: this.capacity,
      used: this.usedIndices.size,
      free: this.freeIndices.length,
      utilization: this.usedIndices.size / this.capacity
    };
  }
}

// Flag constants
export const ParticleFlags = {
  ACTIVE: 1 << 0,
  PHYSICS_ENABLED: 1 << 1,
  ANIMATIONS_ENABLED: 1 << 2,
  FORCE_UPDATE: 1 << 3
};