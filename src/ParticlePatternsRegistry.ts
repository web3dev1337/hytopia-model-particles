import { ParticlePatternFunction } from './types';
import { explosionPattern } from './patterns/explosionPattern';
import { burstPattern } from './patterns/burstPattern';
import { hitPattern } from './patterns/hitPattern';

export const ParticlePatternRegistry: { [name: string]: ParticlePatternFunction } = {
  explosion: explosionPattern,
  burst: burstPattern,
  hit: hitPattern,
};

export function registerParticlePattern(name: string, patternFunc: ParticlePatternFunction): void {
  if (ParticlePatternRegistry[name]) {
    console.warn(`Pattern "${name}" already exists and will be overwritten.`);
  }
  ParticlePatternRegistry[name] = patternFunc;
}

export function getParticlePattern(name: string): ParticlePatternFunction | undefined {
  return ParticlePatternRegistry[name];
} 