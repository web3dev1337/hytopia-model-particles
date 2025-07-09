import { Pattern } from '../patterns/Pattern';
import { ExplosionPattern } from '../patterns/ExplosionPattern';
import { StreamPattern } from '../patterns/StreamPattern';
import { SpiralPattern } from '../patterns/SpiralPattern';
import { WavePattern } from '../patterns/WavePattern';
import { RingPattern } from '../patterns/RingPattern';
import { FountainPattern } from '../patterns/FountainPattern';

export class PatternRegistry {
  private patterns: Map<string, Pattern> = new Map();
  private static instance: PatternRegistry;
  
  private constructor() {
    // Register default patterns
    this.registerDefaults();
  }
  
  static getInstance(): PatternRegistry {
    if (!PatternRegistry.instance) {
      PatternRegistry.instance = new PatternRegistry();
    }
    return PatternRegistry.instance;
  }
  
  private registerDefaults(): void {
    this.registerPattern('explosion', new ExplosionPattern());
    this.registerPattern('stream', new StreamPattern());
    this.registerPattern('spiral', new SpiralPattern());
    this.registerPattern('wave', new WavePattern());
    this.registerPattern('ring', new RingPattern());
    this.registerPattern('fountain', new FountainPattern());
  }
  
  registerPattern(name: string, pattern: Pattern): void {
    this.patterns.set(name.toLowerCase(), pattern);
  }
  
  // Alias for v2.2 compatibility
  register(name: string, pattern: Pattern): void {
    this.registerPattern(name, pattern);
  }
  
  getPattern(name: string): Pattern | undefined {
    return this.patterns.get(name.toLowerCase());
  }
  
  // Alias for v2.2 compatibility
  get(name: string): Pattern | undefined {
    return this.getPattern(name);
  }
  
  hasPattern(name: string): boolean {
    return this.patterns.has(name.toLowerCase());
  }
  
  getPatternNames(): string[] {
    return Array.from(this.patterns.keys());
  }
  
  /**
   * Create a composite pattern from multiple patterns
   */
  composePatterns(patterns: string[], weights?: number[]): CompositePattern {
    const patternInstances = patterns
      .map(name => this.getPattern(name))
      .filter(p => p !== undefined) as Pattern[];
    
    if (patternInstances.length === 0) {
      throw new Error('No valid patterns found for composition');
    }
    
    return new CompositePattern(patternInstances, weights);
  }
  
  /**
   * Clone a pattern with new modifiers
   */
  cloneWithModifiers(name: string, modifiers: Record<string, any>): Pattern | undefined {
    const original = this.getPattern(name);
    if (!original) return undefined;
    
    // Create a new instance of the same type
    const cloned = Object.create(Object.getPrototypeOf(original));
    Object.assign(cloned, original);
    cloned.applyModifiers(modifiers);
    
    return cloned;
  }
}

/**
 * Composite pattern that combines multiple patterns
 */
export class CompositePattern extends Pattern {
  public count: number = 50;
  
  constructor(
    private patterns: Pattern[],
    private weights?: number[]
  ) {
    super();
    
    // Normalize weights
    if (!this.weights || this.weights.length !== this.patterns.length) {
      this.weights = new Array(this.patterns.length).fill(1 / this.patterns.length);
    } else {
      const sum = this.weights.reduce((a, b) => a + b, 0);
      this.weights = this.weights.map(w => w / sum);
    }
  }
  
  generatePoints(): Vector3Like[] {
    const allPoints: Vector3Like[] = [];
    
    for (let i = 0; i < this.patterns.length; i++) {
      const pattern = this.patterns[i];
      const weight = this.weights![i];
      const count = Math.floor(this.count * weight);
      
      pattern.count = count;
      const points = pattern.generatePoints();
      allPoints.push(...points);
    }
    
    return allPoints;
  }
  
  generateVelocities(): Vector3Like[] {
    const allVelocities: Vector3Like[] = [];
    
    for (let i = 0; i < this.patterns.length; i++) {
      const pattern = this.patterns[i];
      const weight = this.weights![i];
      const count = Math.floor(this.count * weight);
      
      pattern.count = count;
      const velocities = pattern.generateVelocities();
      allVelocities.push(...velocities);
    }
    
    return allVelocities;
  }
  
  applyModifiers(modifiers: Record<string, any>): void {
    // Apply modifiers to all sub-patterns
    this.patterns.forEach(pattern => pattern.applyModifiers(modifiers));
    
    if (modifiers.count !== undefined) {
      this.count = modifiers.count;
    }
  }
}

// Import for Vector3Like
import type { Vector3Like } from '../types';