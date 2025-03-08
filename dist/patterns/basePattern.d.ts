import { BasePattern, ParticleEffectConfig } from '../types';
export declare abstract class Pattern implements BasePattern {
    abstract name: string;
    abstract description?: string;
    abstract defaultConfig: ParticleEffectConfig;
    modifiers?: {
        [key: string]: (config: ParticleEffectConfig, value: any) => ParticleEffectConfig;
    };
    constructor();
    protected getDefaultModifiers(): {
        intensity: (config: ParticleEffectConfig, value: number) => {
            particleCount: number;
            speed: {
                min: number;
                max: number;
            };
            model?: string;
            lifetime: number;
            direction?: import("../types").Vector3 | null;
            spread: number;
            size: number;
            pattern?: string;
            patternModifiers?: {
                [key: string]: any;
            };
            physics?: import("../types").PhysicsConfig;
            color?: {
                r: number;
                g: number;
                b: number;
                a?: number;
            };
            fadeOut?: boolean;
            rotationSpeed?: import("../types").SpeedConfig;
            scaleOverTime?: {
                start: number;
                end: number;
            };
        };
        scale: (config: ParticleEffectConfig, value: number) => {
            size: number;
            particleCount: number;
            model?: string;
            lifetime: number;
            speed: import("../types").SpeedConfig;
            direction?: import("../types").Vector3 | null;
            spread: number;
            pattern?: string;
            patternModifiers?: {
                [key: string]: any;
            };
            physics?: import("../types").PhysicsConfig;
            color?: {
                r: number;
                g: number;
                b: number;
                a?: number;
            };
            fadeOut?: boolean;
            rotationSpeed?: import("../types").SpeedConfig;
            scaleOverTime?: {
                start: number;
                end: number;
            };
        };
        duration: (config: ParticleEffectConfig, value: number) => {
            lifetime: number;
            particleCount: number;
            model?: string;
            speed: import("../types").SpeedConfig;
            direction?: import("../types").Vector3 | null;
            spread: number;
            size: number;
            pattern?: string;
            patternModifiers?: {
                [key: string]: any;
            };
            physics?: import("../types").PhysicsConfig;
            color?: {
                r: number;
                g: number;
                b: number;
                a?: number;
            };
            fadeOut?: boolean;
            rotationSpeed?: import("../types").SpeedConfig;
            scaleOverTime?: {
                start: number;
                end: number;
            };
        };
    };
    applyModifiers(config: ParticleEffectConfig, modifiers?: {
        [key: string]: any;
    }): ParticleEffectConfig;
    generate(overrides?: Partial<ParticleEffectConfig>): ParticleEffectConfig;
}
