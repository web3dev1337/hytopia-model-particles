import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { ParticleEffect, Vector3Like } from './types';

export interface YAMLConfig {
  effects: Record<string, ParticleEffect>;
  patterns?: Record<string, any>;
}

export class YAMLLoader {
  static loadFromFile(filepath: string): YAMLConfig {
    try {
      const fileContents = fs.readFileSync(filepath, 'utf8');
      const config = yaml.load(fileContents) as YAMLConfig;
      
      // Validate and transform the config
      if (!config.effects) {
        throw new Error('YAML config must contain "effects" section');
      }
      
      // Process each effect
      for (const [name, effect] of Object.entries(config.effects)) {
        effect.name = name;
        
        // Convert string vectors to Vector3 objects
        if (effect.velocityMin && typeof effect.velocityMin === 'string') {
          effect.velocityMin = this.parseVector3(effect.velocityMin);
        }
        if (effect.velocityMax && typeof effect.velocityMax === 'string') {
          effect.velocityMax = this.parseVector3(effect.velocityMax);
        }
        if (effect.angularVelocityMin && typeof effect.angularVelocityMin === 'string') {
          effect.angularVelocityMin = this.parseVector3(effect.angularVelocityMin);
        }
        if (effect.angularVelocityMax && typeof effect.angularVelocityMax === 'string') {
          effect.angularVelocityMax = this.parseVector3(effect.angularVelocityMax);
        }
      }
      
      return config;
    } catch (error) {
      throw new Error(`Failed to load particle config from ${filepath}: ${error}`);
    }
  }
  
  static loadFromString(yamlString: string): YAMLConfig {
    try {
      const config = yaml.load(yamlString) as YAMLConfig;
      
      if (!config.effects) {
        throw new Error('YAML config must contain "effects" section');
      }
      
      return config;
    } catch (error) {
      throw new Error(`Failed to parse YAML config: ${error}`);
    }
  }
  
  private static parseVector3(str: string): Vector3Like {
    const parts = str.split(',').map(s => parseFloat(s.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) {
      throw new Error(`Invalid Vector3 format: ${str}. Expected "x,y,z"`);
    }
    return { x: parts[0], y: parts[1], z: parts[2] };
  }
}