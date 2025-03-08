"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomRange = randomRange;
exports.randomDirectionWithinCone = randomDirectionWithinCone;
exports.normalizeVector = normalizeVector;
exports.crossProduct = crossProduct;
exports.vectorLength = vectorLength;
function randomRange(min, max) {
    return min + Math.random() * (max - min);
}
function randomDirectionWithinCone(baseDir, angleDeg) {
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
function normalizeVector(vec) {
    const len = vectorLength(vec);
    return len === 0 ? { x: 0, y: 0, z: 0 } : {
        x: vec.x / len,
        y: vec.y / len,
        z: vec.z / len
    };
}
function crossProduct(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}
function vectorLength(vec) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
}
//# sourceMappingURL=utils.js.map