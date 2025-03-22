import { ParticleEffectConfig } from '../types';
import { Pattern } from './base/basePattern';
import { explosionPattern } from './built-in/explosionPattern';
import { streamPattern } from './built-in/streamPattern';
import { sparkPattern } from './built-in/sparkPattern';

export class ParticlePatternRegistry {
  private static patterns: Map<string, Pattern> = new Map();
  private static initialized: boolean = false;

  static initialize(): void {
    if (this.initialized) {
      console.warn('ParticlePatternRegistry is already initialized.');
      return;
    }
    
    // Set initialized to true first
    this.initialized = true;
    
    // Then register patterns
    this.registerDefaultPatterns();
  }

  private static registerDefaultPatterns(): void {
    // Register default patterns
    this.registerPattern(explosionPattern);
    this.registerPattern(streamPattern);
    this.registerPattern(sparkPattern);
  }

  static registerPattern(pattern: Pattern): void {
    if (!this.initialized) {
      throw new Error('ParticlePatternRegistry must be initialized before registering patterns. Call ParticlePatternRegistry.initialize() first.');
    }

    if (this.patterns.has(pattern.name)) {
      console.warn(`Pattern "${pattern.name}" already exists and will be overwritten.`);
    }
    this.patterns.set(pattern.name, pattern);
  }

  static getPattern(name: string): Pattern | undefined {
    if (!this.initialized) {
      throw new Error('ParticlePatternRegistry must be initialized before getting patterns. Call ParticlePatternRegistry.initialize() first.');
    }
    return this.patterns.get(name);
  }

  static generateConfig(patternName: string, overrides?: Partial<ParticleEffectConfig>): ParticleEffectConfig {
    if (!this.initialized) {
      throw new Error('ParticlePatternRegistry must be initialized before generating configs. Call ParticlePatternRegistry.initialize() first.');
    }

    const pattern = this.getPattern(patternName);
    if (!pattern) {
      throw new Error(`Pattern "${patternName}" not found.`);
    }
    return pattern.generate(overrides);
  }

  static listPatterns(): { name: string; description?: string }[] {
    if (!this.initialized) {
      throw new Error('ParticlePatternRegistry must be initialized before listing patterns. Call ParticlePatternRegistry.initialize() first.');
    }

    return Array.from(this.patterns.values()).map(pattern => ({
      name: pattern.name,
      description: pattern.description
    }));
  }
} 