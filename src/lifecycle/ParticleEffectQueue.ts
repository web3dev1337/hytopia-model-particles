import { Vector3, ParticleEffectConfig } from '../types';

interface QueuedEffect {
  effectName: string;
  position: Vector3;
  overrides?: Partial<ParticleEffectConfig>;
  priority: number;
  timestamp: number;
  maxAge?: number;  // Maximum time in queue before being discarded
  batchKey?: string; // For batching similar effects
}

export class ParticleEffectQueue {
  private queue: QueuedEffect[] = [];
  private maxQueueSize: number;
  private batchSize: number;
  private maxEffectsPerFrame: number;
  private defaultMaxAge: number;

  constructor(options: {
    maxQueueSize?: number;
    batchSize?: number;
    maxEffectsPerFrame?: number;
    defaultMaxAge?: number;
  } = {}) {
    this.maxQueueSize = options.maxQueueSize || 1000;
    this.batchSize = options.batchSize || 10;
    this.maxEffectsPerFrame = options.maxEffectsPerFrame || 50;
    this.defaultMaxAge = options.defaultMaxAge || 1000; // 1 second
  }

  enqueue(
    effectName: string,
    position: Vector3,
    overrides?: Partial<ParticleEffectConfig>,
    options: {
      priority?: number;
      maxAge?: number;
      batchKey?: string;
    } = {}
  ): boolean {
    if (this.queue.length >= this.maxQueueSize) {
      // If queue is full, try to make room by removing lowest priority effects
      this.pruneQueue();
      if (this.queue.length >= this.maxQueueSize) {
        return false; // Queue is still full
      }
    }

    const effect: QueuedEffect = {
      effectName,
      position,
      overrides,
      priority: options.priority || 0,
      timestamp: performance.now(),
      maxAge: options.maxAge || this.defaultMaxAge,
      batchKey: options.batchKey || this.generateBatchKey(effectName, position, overrides)
    };

    // Insert maintaining priority order (highest first)
    const insertIndex = this.queue.findIndex(e => e.priority < effect.priority);
    if (insertIndex === -1) {
      this.queue.push(effect);
    } else {
      this.queue.splice(insertIndex, 0, effect);
    }

    return true;
  }

  dequeueEffects(): QueuedEffect[] {
    const currentTime = performance.now();
    const effects: QueuedEffect[] = [];
    const batchedEffects = new Map<string, QueuedEffect[]>();

    // First, batch similar effects
    for (const effect of this.queue) {
      if (effects.length >= this.maxEffectsPerFrame) break;
      
      // Skip expired effects
      if (currentTime - effect.timestamp > effect.maxAge!) {
        continue;
      }

      const batch = batchedEffects.get(effect.batchKey!) || [];
      batch.push(effect);
      batchedEffects.set(effect.batchKey!, batch);

      // If batch is full, add it to effects list
      if (batch.length >= this.batchSize) {
        effects.push(...batch);
        batchedEffects.delete(effect.batchKey!);
      }
    }

    // Add remaining batches that weren't full
    for (const batch of batchedEffects.values()) {
      if (effects.length + batch.length <= this.maxEffectsPerFrame) {
        effects.push(...batch);
      }
    }

    // Remove dequeued and expired effects from queue
    this.queue = this.queue.filter(effect => {
      const isDequeued = effects.includes(effect);
      const isExpired = currentTime - effect.timestamp > effect.maxAge!;
      return !isDequeued && !isExpired;
    });

    return effects;
  }

  private pruneQueue(): void {
    const currentTime = performance.now();

    // First remove expired effects
    this.queue = this.queue.filter(effect => 
      currentTime - effect.timestamp <= effect.maxAge!
    );

    // If still too many, remove lowest priority effects
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.sort((a, b) => b.priority - a.priority);
      this.queue.length = Math.floor(this.maxQueueSize * 0.8); // Remove 20% of effects
    }
  }

  private generateBatchKey(
    effectName: string,
    position: Vector3,
    overrides?: Partial<ParticleEffectConfig>
  ): string {
    // Group effects by name and rough position (rounded to nearest unit)
    const x = Math.round(position.x);
    const y = Math.round(position.y);
    const z = Math.round(position.z);
    return `${effectName}_${x}_${y}_${z}`;
  }

  clear(): void {
    this.queue = [];
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getQueueStats(): {
    total: number;
    byPriority: { [priority: number]: number };
    byEffect: { [effectName: string]: number };
  } {
    const stats = {
      total: this.queue.length,
      byPriority: {} as { [priority: number]: number },
      byEffect: {} as { [effectName: string]: number }
    };

    for (const effect of this.queue) {
      // Count by priority
      stats.byPriority[effect.priority] = (stats.byPriority[effect.priority] || 0) + 1;
      
      // Count by effect name
      stats.byEffect[effect.effectName] = (stats.byEffect[effect.effectName] || 0) + 1;
    }

    return stats;
  }
} 