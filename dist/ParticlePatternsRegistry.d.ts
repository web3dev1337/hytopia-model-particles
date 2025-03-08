import { ParticleEffectConfig } from './types';
import { Pattern } from './patterns/basePattern';
export declare class ParticlePatternRegistry {
    private static patterns;
    static registerDefaultPatterns(): void;
    static registerPattern(pattern: Pattern): void;
    static getPattern(name: string): Pattern | undefined;
    static generateConfig(patternName: string, overrides?: Partial<ParticleEffectConfig>): ParticleEffectConfig;
    static listPatterns(): {
        name: string;
        description?: string;
    }[];
}
