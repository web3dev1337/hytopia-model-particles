import { Entity, World } from 'hytopia';
import type { Vector3Like } from 'hytopia';
import { ParticleConfig } from './types';
export declare class Particle {
    private config;
    private entityFactory?;
    private entity;
    private spawnTime;
    private lifetime;
    private isActive;
    private velocity?;
    private angularVelocity?;
    constructor(config: ParticleConfig, entityFactory?: ((config: any) => Entity) | undefined);
    spawn(world: World, position: Vector3Like, velocity?: Vector3Like, angularVelocity?: Vector3Like): void;
    update(): boolean;
    despawn(): void;
    reset(config?: Partial<ParticleConfig>): void;
    get active(): boolean;
    get position(): Vector3Like | undefined;
}
//# sourceMappingURL=Particle.d.ts.map