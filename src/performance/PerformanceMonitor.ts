import { PerformanceMetrics, PerformanceOptions } from '../types';

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private options: Required<PerformanceOptions>;
  private fpsHistory: number[] = [];
  private lastFrameTime: number = Date.now();
  private frameCount: number = 0;
  private monitoringStartTime: number = Date.now();
  
  constructor(options: PerformanceOptions = {}) {
    this.options = {
      enableAdaptiveQuality: options.enableAdaptiveQuality ?? true,
      targetFPS: options.targetFPS ?? 60,
      qualityLevels: options.qualityLevels ?? {
        high: { maxParticles: 1000, particleScale: 1.0 },
        medium: { maxParticles: 500, particleScale: 0.8 },
        low: { maxParticles: 200, particleScale: 0.6 }
      },
      monitoringInterval: options.monitoringInterval ?? 1000
    };

    this.metrics = {
      currentFPS: 60,
      averageFPS: 60,
      particleCount: 0,
      poolSize: 0,
      qualityLevel: 'high',
      droppedFrames: 0,
      lastFrameTime: Date.now()
    };
  }

  /**
   * Update performance metrics
   */
  update(activeParticleCount: number, poolSize: number): void {
    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;
    
    // Calculate current FPS
    if (deltaTime > 0) {
      this.metrics.currentFPS = Math.min(1000 / deltaTime, 144); // Cap at 144 FPS
      this.fpsHistory.push(this.metrics.currentFPS);
      
      // Keep only last 60 frames for average
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      // Calculate average FPS
      this.metrics.averageFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    }
    
    // Check for dropped frames
    if (deltaTime > (1000 / this.options.targetFPS) * 1.5) {
      this.metrics.droppedFrames++;
    }
    
    // Update metrics
    this.metrics.particleCount = activeParticleCount;
    this.metrics.poolSize = poolSize;
    this.metrics.lastFrameTime = now;
    this.lastFrameTime = now;
    this.frameCount++;
    
    // Adapt quality if enabled
    if (this.options.enableAdaptiveQuality) {
      this.adaptQuality();
    }
  }

  /**
   * Adapt quality based on performance
   */
  private adaptQuality(): void {
    const { averageFPS } = this.metrics;
    const { targetFPS } = this.options;
    
    // Hysteresis to prevent rapid quality changes
    const lowerThreshold = targetFPS * 0.8;
    const upperThreshold = targetFPS * 1.1;
    
    if (averageFPS < lowerThreshold) {
      // Performance is poor, reduce quality
      if (this.metrics.qualityLevel === 'high') {
        this.metrics.qualityLevel = 'medium';
      } else if (this.metrics.qualityLevel === 'medium') {
        this.metrics.qualityLevel = 'low';
      }
    } else if (averageFPS > upperThreshold) {
      // Performance is good, increase quality
      if (this.metrics.qualityLevel === 'low') {
        this.metrics.qualityLevel = 'medium';
      } else if (this.metrics.qualityLevel === 'medium' && 
                 this.metrics.particleCount < this.options.qualityLevels.high.maxParticles * 0.7) {
        this.metrics.qualityLevel = 'high';
      }
    }
  }

  /**
   * Get current quality settings
   */
  getCurrentQualitySettings(): { maxParticles: number; particleScale?: number } {
    return this.options.qualityLevels[this.metrics.qualityLevel];
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Should spawn particle based on current performance
   */
  shouldSpawnParticle(): boolean {
    if (!this.options.enableAdaptiveQuality) {
      return true;
    }
    
    const qualitySettings = this.getCurrentQualitySettings();
    return this.metrics.particleCount < qualitySettings.maxParticles;
  }

  /**
   * Get particle scale modifier based on quality
   */
  getParticleScaleModifier(): number {
    const qualitySettings = this.getCurrentQualitySettings();
    return qualitySettings.particleScale ?? 1.0;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.fpsHistory = [];
    this.metrics.droppedFrames = 0;
    this.metrics.qualityLevel = 'high';
    this.monitoringStartTime = Date.now();
    this.frameCount = 0;
  }

  /**
   * Get performance report
   */
  getReport(): string {
    const runtime = (Date.now() - this.monitoringStartTime) / 1000;
    return `
Performance Report:
- Current FPS: ${this.metrics.currentFPS.toFixed(1)}
- Average FPS: ${this.metrics.averageFPS.toFixed(1)}
- Quality Level: ${this.metrics.qualityLevel}
- Active Particles: ${this.metrics.particleCount}
- Pool Size: ${this.metrics.poolSize}
- Dropped Frames: ${this.metrics.droppedFrames}
- Runtime: ${runtime.toFixed(1)}s
- Total Frames: ${this.frameCount}
    `.trim();
  }
}