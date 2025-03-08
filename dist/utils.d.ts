import { Vector3 } from './types';
export declare function randomRange(min: number, max: number): number;
export declare function randomDirectionWithinCone(baseDir: Vector3 | null, angleDeg: number): Vector3;
export declare function normalizeVector(vec: Vector3): Vector3;
export declare function crossProduct(a: Vector3, b: Vector3): Vector3;
export declare function vectorLength(vec: Vector3): number;
