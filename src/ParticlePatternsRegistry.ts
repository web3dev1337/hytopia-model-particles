import { ParticleEffectConfig } from './types';
import { Pattern } from './patterns/basePattern';
import { explosionPattern } from './patterns/explosionPattern';
import { burstPattern } from './patterns/burstPattern';
import { hitPattern } from './patterns/hitPattern';

export class ParticlePatternRegistry {
  private static patterns: Map<string, Pattern> = new Map();

  static {
    // Register default patterns
    this.registerPattern(explosionPattern);
    this.registerPattern(burstPattern);
    this.registerPattern(hitPattern);
  }

  static registerPattern(pattern: Pattern): void {
    if (this.patterns.has(pattern.name)) {
      console.warn(`Pattern "${pattern.name}" already exists and will be overwritten.`);
    }
    this.patterns.set(pattern.name, pattern);
  }

  static getPattern(name: string): Pattern | undefined {
    return this.patterns.get(name);
  }

  static generateConfig(patternName: string, overrides?: Partial<ParticleEffectConfig>): ParticleEffectConfig {
    const pattern = this.getPattern(patternName);
    if (!pattern) {
      throw new Error(`Pattern "${patternName}" not found.`);
    }
    return pattern.generate(overrides);
  }

  static listPatterns(): { name: string; description?: string }[] {
    return Array.from(this.patterns.values()).map(pattern => ({
      name: pattern.name,
      description: pattern.description
    }));
  }
} 