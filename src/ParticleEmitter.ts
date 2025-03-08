import { World, ParticleEffectConfig, ParticleConfigFile, Vector3 } from './types';
import { loadParticleConfig, validateConfig } from './ParticleConfigLoader';
import { ParticlePool } from './ParticlePool';
import { ParticlePatternRegistry } from './ParticlePatternsRegistry';

export class ParticleEmitter {
  private world: World;
  private effectConfigs: { [name: string]: ParticleEffectConfig } = {};
  private pools: { [name: string]: ParticlePool } = {};
  private adaptivePerformance: boolean = true;
  private maxParticles: number = 500;
  private avgFps: number = 60;

  constructor(world: World, config?: string | ParticleConfigFile) {
    this.world = world;
    if (config) {
      if (typeof config === 'string') {
        this.loadConfigFromFile(config);
      } else {
        this.applyConfig(config);
      }
    } else {
      this.applyConfig(this.getDefaultConfig());
    }
  }

  static fromYaml(configFilePath: string, world: World): ParticleEmitter {
    return new ParticleEmitter(world, configFilePath);
  }

  private loadConfigFromFile(filePath: string): void {
    try {
      const configObj = loadParticleConfig(filePath);
      validateConfig(configObj);
      this.applyConfig(configObj);
    } catch (err) {
      console.error('Error loading config, using defaults:', err);
      this.applyConfig(this.getDefaultConfig());
    }
  }

  private applyConfig(configObj: ParticleConfigFile): void {
    const defaults = this.getDefaultConfig();
    const merged: ParticleConfigFile = { effects: {}, global: {} };

    // Merge global settings
    merged.global = { ...defaults.global, ...configObj.global };

    // Start with default effects
    for (const effectName in defaults.effects) {
      merged.effects[effectName] = { ...defaults.effects[effectName] };
    }

    // Merge with provided effects
    for (const effectName in configObj.effects) {
      let mergedEffect = { ...merged.effects[effectName], ...configObj.effects[effectName] };

      // Apply pattern if specified
      if (mergedEffect.pattern) {
        const patternName = mergedEffect.pattern as string;
        const patternFunc = ParticlePatternRegistry[patternName];
        if (patternFunc) {
          mergedEffect = { ...patternFunc(), ...mergedEffect };
          delete mergedEffect.pattern;
        }
      }
      merged.effects[effectName] = mergedEffect;
    }

    // Apply global settings
    if (merged.global) {
      this.adaptivePerformance = merged.global.adaptivePerformance !== false;
      if (merged.global.maxParticles) {
        this.maxParticles = merged.global.maxParticles;
      }
    }

    // Initialize effect pools
    this.effectConfigs = merged.effects;
    this.pools = {};
    for (const effectName in this.effectConfigs) {
      this.pools[effectName] = new ParticlePool();
    }
  }

  private getDefaultConfig(): ParticleConfigFile {
    return {
      effects: {
        explosion: ParticlePatternRegistry.explosion(),
        burst: ParticlePatternRegistry.burst(),
        hit: ParticlePatternRegistry.hit(),
      },
      global: {
        adaptivePerformance: true,
        maxParticles: 500,
      },
    };
  }

  emitEffect(effectName: string, position: Vector3, overrides?: Partial<ParticleEffectConfig>): void {
    const cfg = this.effectConfigs[effectName];
    if (!cfg) {
      console.warn(`Effect "${effectName}" not defined.`);
      return;
    }

    const effectiveCfg: ParticleEffectConfig = { ...cfg, ...overrides };
    let count = effectiveCfg.particleCount;

    // Adjust particle count based on performance if enabled
    if (this.adaptivePerformance) {
      const fpsRatio = Math.min(this.avgFps / 60, 1);
      count = Math.floor(count * fpsRatio) || 1;
    }

    // Emit particles
    for (let i = 0; i < count; i++) {
      if (this.getTotalActiveParticles() >= this.maxParticles) break;

      const pool = this.pools[effectName];
      const particle = pool.getParticle(
        effectiveCfg.model,
        effectiveCfg.size,
        effectiveCfg.usePhysics ?? false,
        effectiveCfg.gravity ?? true,
        this.maxParticles
      );

      if (!particle) continue;

      const initSpeed = this.randomRange(effectiveCfg.speed.min, effectiveCfg.speed.max);
      const baseDir = effectiveCfg.direction || null;
      const dir = this.randomDirectionWithinCone(baseDir, effectiveCfg.spread);
      const velocity = {
        x: dir.x * initSpeed,
        y: dir.y * initSpeed,
        z: dir.z * initSpeed,
      };

      particle.spawn(
        this.world,
        position,
        velocity,
        effectiveCfg.lifetime,
        effectiveCfg.usePhysics ?? false,
        effectiveCfg.gravity ?? true
      );
    }
  }

  update(deltaTime: number): void {
    const currentFPS = deltaTime > 0 ? (1 / deltaTime) : 60;
    this.avgFps = 0.95 * this.avgFps + 0.05 * currentFPS;

    for (const effectName in this.pools) {
      const cfg = this.effectConfigs[effectName];
      this.pools[effectName].updateAll(deltaTime, cfg.usePhysics ?? false, cfg.gravity ?? true);
    }
  }

  private getTotalActiveParticles(): number {
    let total = 0;
    for (const effectName in this.pools) {
      total += this.pools[effectName].getActiveParticleCount();
    }
    return total;
  }

  private randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private randomDirectionWithinCone(baseDir: Vector3 | null, angleDeg: number): Vector3 {
    if (!baseDir) {
      return this.randomDirectionWithinCone({ x: 0, y: 1, z: 0 }, 180);
    }

    const b = this.normalizeVector(baseDir);
    const angleRad = (angleDeg * Math.PI) / 180;

    // For full sphere or hemisphere emission
    if (angleDeg >= 360 || angleDeg >= 180) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      return {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
      };
    }

    // For cone emission
    let uVec = this.crossProduct(b, { x: 0, y: 1, z: 0 });
    if (this.vectorLength(uVec) < 0.001) {
      uVec = this.crossProduct(b, { x: 1, y: 0, z: 0 });
    }
    uVec = this.normalizeVector(uVec);

    const vVec = this.normalizeVector(this.crossProduct(b, uVec));
    const cosTheta = Math.cos(angleRad);
    const randCos = Math.random() * (1 - cosTheta) + cosTheta;
    const theta = Math.acos(randCos);
    const phi = Math.random() * 2 * Math.PI;
    const sinTheta = Math.sin(theta);

    return this.normalizeVector({
      x: b.x * Math.cos(theta) + (uVec.x * Math.cos(phi) + vVec.x * Math.sin(phi)) * sinTheta,
      y: b.y * Math.cos(theta) + (uVec.y * Math.cos(phi) + vVec.y * Math.sin(phi)) * sinTheta,
      z: b.z * Math.cos(theta) + (uVec.z * Math.cos(phi) + vVec.z * Math.sin(phi)) * sinTheta,
    });
  }

  private normalizeVector(vec: Vector3): Vector3 {
    const len = this.vectorLength(vec);
    return len === 0 ? { x: 0, y: 0, z: 0 } : {
      x: vec.x / len,
      y: vec.y / len,
      z: vec.z / len,
    };
  }

  private crossProduct(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  }

  private vectorLength(vec: Vector3): number {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
  }
}