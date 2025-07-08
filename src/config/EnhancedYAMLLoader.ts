import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { ParticleEffect, ParticleConfig, AnimationCurve, ColorGradient } from '../types';

export interface EffectTemplate {
  name: string;
  extends?: string;
  [key: string]: any;
}

export interface YAMLConfig {
  templates?: Record<string, EffectTemplate>;
  effects?: Record<string, ParticleEffect>;
  patterns?: Record<string, any>;
}

export class EnhancedYAMLLoader {
  private templates: Map<string, EffectTemplate> = new Map();
  private effects: Map<string, ParticleEffect> = new Map();
  private watchedFiles: Set<string> = new Set();
  private hotReloadEnabled: boolean = false;
  private fileWatchers: Map<string, fs.FSWatcher> = new Map();
  
  constructor(hotReload: boolean = false) {
    this.hotReloadEnabled = hotReload;
  }
  
  /**
   * Load effects from YAML file
   */
  loadFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const config = yaml.load(content) as YAMLConfig;
      
      // Load templates first
      if (config.templates) {
        this.loadTemplates(config.templates);
      }
      
      // Load effects
      if (config.effects) {
        this.loadEffects(config.effects);
      }
      
      // Set up hot reload if enabled
      if (this.hotReloadEnabled && !this.watchedFiles.has(filePath)) {
        this.watchFile(filePath);
      }
      
    } catch (error) {
      console.error(`Failed to load YAML file ${filePath}:`, error);
    }
  }
  
  /**
   * Load effects directory
   */
  loadDirectory(dirPath: string): void {
    try {
      const files = fs.readdirSync(dirPath);
      const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
      
      for (const file of yamlFiles) {
        this.loadFile(`${dirPath}/${file}`);
      }
    } catch (error) {
      console.error(`Failed to load directory ${dirPath}:`, error);
    }
  }
  
  /**
   * Load templates
   */
  private loadTemplates(templates: Record<string, EffectTemplate>): void {
    for (const [name, template] of Object.entries(templates)) {
      this.templates.set(name, { ...template, name });
    }
  }
  
  /**
   * Load effects with template inheritance
   */
  private loadEffects(effects: Record<string, any>): void {
    for (const [name, effectData] of Object.entries(effects)) {
      const effect = this.parseEffect(name, effectData);
      if (effect) {
        this.effects.set(name, effect);
      }
    }
  }
  
  /**
   * Parse effect with template inheritance
   */
  private parseEffect(name: string, data: any): ParticleEffect | null {
    let effectData = { ...data };
    
    // Handle template inheritance
    if (data.extends) {
      const template = this.templates.get(data.extends);
      if (template) {
        effectData = this.mergeWithTemplate(template, data);
      }
    }
    
    // Parse config
    const config = this.parseConfig(effectData.config || effectData);
    
    // Create effect
    const effect: ParticleEffect = {
      name,
      config,
      count: effectData.count || 10,
      spread: effectData.spread,
      velocityMin: effectData.velocityMin,
      velocityMax: effectData.velocityMax,
      angularVelocityMin: effectData.angularVelocityMin,
      angularVelocityMax: effectData.angularVelocityMax,
      scaleVariation: effectData.scaleVariation,
      lifetimeVariation: effectData.lifetimeVariation,
      pattern: effectData.pattern,
      patternModifiers: effectData.patternModifiers
    };
    
    return effect;
  }
  
  /**
   * Parse particle config with animation support
   */
  private parseConfig(data: any): ParticleConfig {
    const config: ParticleConfig = {
      modelUri: data.modelUri || data.model,
      lifetime: data.lifetime
    };
    
    // Parse scale
    if (data.modelScale) {
      if (typeof data.modelScale === 'object') {
        config.modelScale = data.modelScale;
      } else {
        config.modelScale = data.modelScale;
      }
    } else if (data.scale) {
      config.modelScale = data.scale;
    }
    
    // Parse color/tint
    if (data.tintColor) {
      if (data.tintColor.keyframes) {
        config.tintColor = this.parseColorGradient(data.tintColor);
      } else {
        config.tintColor = data.tintColor;
      }
    } else if (data.color) {
      config.tintColor = data.color;
    }
    
    // Parse physics
    if (data.physics) {
      config.mass = data.physics.mass;
      config.friction = data.physics.friction;
      config.bounciness = data.physics.bounciness || data.physics.restitution;
      config.useGravity = data.physics.useGravity;
      config.gravityScale = data.physics.gravityScale;
    }
    
    // Parse collision
    if (data.collision) {
      config.collisionGroup = data.collision.group;
      config.collisionMask = data.collision.mask;
    }
    
    // Parse animations
    if (data.animations || data.visual) {
      config.animations = this.parseAnimations(data.animations || data.visual);
    }
    
    // Parse opacity
    if (data.opacity) {
      config.opacity = data.opacity;
    }
    
    // Parse rotation
    if (data.rotation) {
      config.rotation = data.rotation;
    }
    
    return config;
  }
  
  /**
   * Parse animations
   */
  private parseAnimations(data: any): any {
    const animations: any = {};
    
    if (data.scaleOverTime) {
      animations.scaleOverTime = {
        start: data.scaleOverTime.start,
        end: data.scaleOverTime.end,
        curve: this.parseAnimationCurve(data.scaleOverTime.curve)
      };
    }
    
    if (data.colorOverTime) {
      animations.colorOverTime = this.parseColorGradient(data.colorOverTime);
    }
    
    if (data.opacityOverTime) {
      animations.opacityOverTime = {
        start: data.opacityOverTime.start,
        end: data.opacityOverTime.end,
        curve: this.parseAnimationCurve(data.opacityOverTime.curve)
      };
    }
    
    if (data.rotationOverTime) {
      animations.rotationOverTime = data.rotationOverTime;
    }
    
    return animations;
  }
  
  /**
   * Parse animation curve
   */
  private parseAnimationCurve(data: any): AnimationCurve | undefined {
    if (!data) return undefined;
    
    if (typeof data === 'string') {
      return { type: data as any };
    }
    
    return data;
  }
  
  /**
   * Parse color gradient
   */
  private parseColorGradient(data: any): ColorGradient {
    return {
      type: data.type || 'linear',
      keyframes: data.keyframes || []
    };
  }
  
  /**
   * Merge with template
   */
  private mergeWithTemplate(template: EffectTemplate, data: any): any {
    const { name, extends: extendsField, ...templateWithoutMeta } = template;
    const merged = { ...templateWithoutMeta };
    
    // Deep merge
    for (const [key, value] of Object.entries(data)) {
      if (key === 'extends') continue;
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        merged[key] = { ...(merged[key] || {}), ...value };
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }
  
  /**
   * Watch file for changes
   */
  private watchFile(filePath: string): void {
    const watcher = fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
        console.log(`Reloading particle effects from ${filePath}`);
        this.loadFile(filePath);
      }
    });
    
    this.fileWatchers.set(filePath, watcher);
    this.watchedFiles.add(filePath);
  }
  
  /**
   * Stop watching files
   */
  stopWatching(): void {
    for (const watcher of this.fileWatchers.values()) {
      watcher.close();
    }
    this.fileWatchers.clear();
    this.watchedFiles.clear();
  }
  
  /**
   * Get loaded effect
   */
  getEffect(name: string): ParticleEffect | undefined {
    return this.effects.get(name);
  }
  
  /**
   * Get all loaded effects
   */
  getAllEffects(): Map<string, ParticleEffect> {
    return new Map(this.effects);
  }
}