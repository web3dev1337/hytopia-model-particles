import { Vector3 } from '../types';

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomDirectionWithinCone(baseDir: Vector3 | null, angleDeg: number): Vector3 {
  if (!baseDir) {
    return randomDirectionWithinCone({ x: 0, y: 1, z: 0 }, 180);
  }

  const b = normalizeVector(baseDir);
  const angleRad = (angleDeg * Math.PI) / 180;

  if (angleDeg >= 360 || angleDeg >= 180) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    return {
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.sin(phi) * Math.sin(theta),
      z: Math.cos(phi)
    };
  }

  let uVec = crossProduct(b, { x: 0, y: 1, z: 0 });
  if (vectorLength(uVec) < 0.001) {
    uVec = crossProduct(b, { x: 1, y: 0, z: 0 });
  }
  uVec = normalizeVector(uVec);
  const vVec = normalizeVector(crossProduct(b, uVec));
  
  const cosTheta = Math.cos(angleRad);
  const randCos = Math.random() * (1 - cosTheta) + cosTheta;
  const theta = Math.acos(randCos);
  const phi = Math.random() * 2 * Math.PI;
  const sinTheta = Math.sin(theta);

  return normalizeVector({
    x: b.x * Math.cos(theta) + (uVec.x * Math.cos(phi) + vVec.x * Math.sin(phi)) * sinTheta,
    y: b.y * Math.cos(theta) + (uVec.y * Math.cos(phi) + vVec.y * Math.sin(phi)) * sinTheta,
    z: b.z * Math.cos(theta) + (uVec.z * Math.cos(phi) + vVec.z * Math.sin(phi)) * sinTheta
  });
}

export function normalizeVector(vec: Vector3): Vector3 {
  const len = vectorLength(vec);
  return len === 0 ? { x: 0, y: 0, z: 0 } : {
    x: vec.x / len,
    y: vec.y / len,
    z: vec.z / len
  };
}

export function crossProduct(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

export function vectorLength(vec: Vector3): number {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
} 