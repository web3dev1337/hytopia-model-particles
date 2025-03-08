import { ParticleEffectConfig } from '../types';
import { Pattern } from './basePattern';
export declare class ExplosionPattern extends Pattern {
    name: string;
    description: string;
    defaultConfig: ParticleEffectConfig;
    constructor();
}
export declare const explosionPattern: ExplosionPattern;
