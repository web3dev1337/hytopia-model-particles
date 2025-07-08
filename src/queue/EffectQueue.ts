import { QueuedEffect } from '../types';
import type { Vector3Like } from '../types';

export class EffectQueue {
  private queue: QueuedEffect[] = [];
  private processing: boolean = false;
  private maxQueueSize: number;
  private maxEffectsPerFrame: number;
  
  constructor(
    maxQueueSize: number = 100,
    maxEffectsPerFrame: number = 5
  ) {
    this.maxQueueSize = maxQueueSize;
    this.maxEffectsPerFrame = maxEffectsPerFrame;
  }
  
  /**
   * Add effect to queue with priority
   * Higher priority effects are processed first
   */
  enqueue(
    effectName: string,
    position: Vector3Like,
    priority: number = 0,
    options?: any
  ): boolean {
    // Check queue capacity
    if (this.queue.length >= this.maxQueueSize) {
      // Remove lowest priority item if queue is full
      this.queue.sort((a, b) => b.priority - a.priority);
      this.queue.pop();
    }
    
    const effect: QueuedEffect = {
      effectName,
      position,
      options,
      priority,
      timestamp: Date.now()
    };
    
    this.queue.push(effect);
    this.queue.sort((a, b) => b.priority - a.priority);
    
    return true;
  }
  
  /**
   * Process queued effects
   * Returns array of effects to spawn this frame
   */
  process(): QueuedEffect[] {
    if (this.processing || this.queue.length === 0) {
      return [];
    }
    
    this.processing = true;
    const toSpawn: QueuedEffect[] = [];
    const now = Date.now();
    
    // Remove stale effects (older than 5 seconds)
    this.queue = this.queue.filter(effect => 
      now - effect.timestamp < 5000
    );
    
    // Get effects to spawn this frame
    const spawnCount = Math.min(this.maxEffectsPerFrame, this.queue.length);
    for (let i = 0; i < spawnCount; i++) {
      const effect = this.queue.shift();
      if (effect) {
        toSpawn.push(effect);
      }
    }
    
    this.processing = false;
    return toSpawn;
  }
  
  /**
   * Clear all queued effects
   */
  clear(): void {
    this.queue = [];
  }
  
  /**
   * Get current queue size
   */
  size(): number {
    return this.queue.length;
  }
  
  /**
   * Check if queue is full
   */
  isFull(): boolean {
    return this.queue.length >= this.maxQueueSize;
  }
  
  /**
   * Get queue status
   */
  getStatus(): {
    queueSize: number;
    maxSize: number;
    oldestEffect: number | null;
    highestPriority: number | null;
  } {
    const oldestEffect = this.queue.length > 0
      ? Date.now() - this.queue[this.queue.length - 1].timestamp
      : null;
      
    const highestPriority = this.queue.length > 0
      ? this.queue[0].priority
      : null;
    
    return {
      queueSize: this.queue.length,
      maxSize: this.maxQueueSize,
      oldestEffect,
      highestPriority
    };
  }
}