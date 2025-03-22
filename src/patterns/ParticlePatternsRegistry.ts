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
    
    console.log('Initializing ParticlePatternRegistry...');
    
    // Set initialized to true first
    this.initialized = true;
    
    // Then register patterns with debug info
    console.log('Registering explosion pattern:', explosionPattern.name);
    this.registerPattern(explosionPattern);
    
    console.log('Registering stream pattern:', streamPattern.name);
    this.registerPattern(streamPattern);
    
    console.log('Registering spark pattern:', sparkPattern.name);
    this.registerPattern(sparkPattern);

    // Log registered patterns
    const patterns = this.listPatterns();
    console.log('Successfully registered patterns:');
    patterns.forEach(p => {
      console.log(`- "${p.name}": ${p.description || 'No description'}`);
    });
  }

  static registerPattern(pattern: Pattern): void {
    if (!this.initialized) {
      throw new Error('ParticlePatternRegistry must be initialized before registering patterns. Call ParticlePatternRegistry.initialize() first.');
    }

    if (!pattern) {
      throw new Error('Cannot register null or undefined pattern');
    }

    if (!pattern.name) {
      throw new Error('Pattern must have a name');
    }

    console.log(`Registering pattern "${pattern.name}"...`);
    
    if (this.patterns.has(pattern.name)) {
      console.warn(`Pattern "${pattern.name}" already exists and will be overwritten.`);
    }
    
    this.patterns.set(pattern.name, pattern);
    console.log(`Successfully registered pattern "${pattern.name}"`);
  }

  static getPattern(name: string): Pattern | undefined {
    if (!this.initialized) {
      throw new Error('ParticlePatternRegistry must be initialized before getting patterns. Call ParticlePatternRegistry.initialize() first.');
    }

    console.log(`Looking for pattern "${name}"...`);
    console.log('Available patterns:', Array.from(this.patterns.keys()));
    
    const pattern = this.patterns.get(name);
    if (!pattern) {
      const availablePatterns = Array.from(this.patterns.keys()).join('", "');
      console.warn(`Pattern "${name}" not found. Available patterns: "${availablePatterns}"`);
    } else {
      console.log(`Found pattern "${name}"`);
    }
    return pattern;
  }

  static generateConfig(patternName: string, overrides?: Partial<ParticleEffectConfig>): ParticleEffectConfig {
    if (!this.initialized) {
      throw new Error('ParticlePatternRegistry must be initialized before generating configs. Call ParticlePatternRegistry.initialize() first.');
    }

    console.log(`Generating config for pattern "${patternName}"...`);
    
    const pattern = this.getPattern(patternName);
    if (!pattern) {
      const availablePatterns = Array.from(this.patterns.keys()).join('", "');
      throw new Error(`Pattern "${patternName}" not found. Available patterns: "${availablePatterns}"`);
    }
    
    const config = pattern.generate(overrides);
    console.log(`Generated config for "${patternName}":`, config);
    return config;
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
  
  static getPatternNames(): string[] {
    if (!this.initialized) {
      throw new Error('ParticlePatternRegistry must be initialized before getting pattern names. Call ParticlePatternRegistry.initialize() first.');
    }
    
    return Array.from(this.patterns.keys());
  }
} 