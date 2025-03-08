import { Vector3, World } from './types';
export declare class Particle {
    private entity;
    private inUse;
    private life;
    private velocity;
    constructor(world: World, modelUri?: string, size?: number);
    spawn(world: World, position: Vector3, velocity: Vector3, lifetime: number, usePhysics: boolean, gravity: boolean): void;
    update(deltaTime: number, usePhysics: boolean, gravity: boolean): void;
    despawn(): void;
    isInUse(): boolean;
}
