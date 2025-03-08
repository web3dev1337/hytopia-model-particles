import { PhysicsConfig, Vector3, Entity } from './types';
export declare class PhysicsController {
    private config;
    private entity;
    private time;
    constructor(entity: Entity, config: PhysicsConfig);
    update(deltaTime: number): void;
    private applyForces;
    private applyForce;
    private applyConstraints;
    private getMass;
    addForce(force: Vector3): void;
    addExplosionForce(center: Vector3, force: number, radius: number): void;
    setVelocity(velocity: Vector3): void;
    getVelocity(): Vector3;
}
