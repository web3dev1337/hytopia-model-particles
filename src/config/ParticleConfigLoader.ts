import { readFileSync } from 'fs';
import { load as loadYAML } from 'js-yaml';
import { ParticleConfigFile } from '../types';

export function loadParticleConfig(filePath: string): ParticleConfigFile {
  try {
    const raw = readFileSync(filePath, 'utf8');
    
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      return loadYAML(raw) as ParticleConfigFile;
    }
    
    if (filePath.endsWith('.json')) {
      return JSON.parse(raw);
    }
    
    // Try YAML first, then JSON if YAML fails
    try {
      return loadYAML(raw) as ParticleConfigFile;
    } catch {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error(`Error loading particle config from ${filePath}:`, error);
    throw error;
  }
}

export function validateConfig(config: ParticleConfigFile): void {
  if (!config.effects || typeof config.effects !== 'object') {
    throw new Error('Config must contain an "effects" object');
  }

  for (const [effectName, effect] of Object.entries(config.effects)) {
    if (!effect.particleCount || effect.particleCount < 1) {
      throw new Error(`Effect "${effectName}" must have a positive particleCount`);
    }
    
    if (!effect.lifetime || effect.lifetime <= 0) {
      throw new Error(`Effect "${effectName}" must have a positive lifetime`);
    }
    
    if (!effect.speed || typeof effect.speed.min !== 'number' || typeof effect.speed.max !== 'number') {
      throw new Error(`Effect "${effectName}" must have valid speed.min and speed.max values`);
    }
    
    if (effect.speed.min > effect.speed.max) {
      throw new Error(`Effect "${effectName}" speed.min cannot be greater than speed.max`);
    }
    
    if (typeof effect.spread !== 'number' || effect.spread < 0 || effect.spread > 360) {
      throw new Error(`Effect "${effectName}" must have a spread value between 0 and 360`);
    }
    
    if (typeof effect.size !== 'number' || effect.size <= 0) {
      throw new Error(`Effect "${effectName}" must have a positive size value`);
    }
  }
} 