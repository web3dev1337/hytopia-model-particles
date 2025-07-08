import { AnimationCurve, ColorGradient, ColorLike } from '../types';

export class AnimationSystem {
  /**
   * Interpolate between two values using an animation curve
   */
  static interpolateValue(
    start: number, 
    end: number, 
    progress: number, 
    curve?: AnimationCurve
  ): number {
    if (!curve || curve.type === 'linear') {
      return start + (end - start) * progress;
    }

    switch (curve.type) {
      case 'easeIn':
        return start + (end - start) * (progress * progress);
      
      case 'easeOut':
        return start + (end - start) * (1 - Math.pow(1 - progress, 2));
      
      case 'easeInOut':
        return start + (end - start) * (
          progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2
        );
      
      case 'curve':
        if (curve.keyframes) {
          return this.interpolateKeyframes(curve.keyframes, progress);
        }
        return start + (end - start) * progress;
      
      default:
        return start + (end - start) * progress;
    }
  }

  /**
   * Interpolate between keyframes
   */
  private static interpolateKeyframes(
    keyframes: { time: number; value: number }[], 
    progress: number
  ): number {
    if (keyframes.length === 0) return 0;
    if (keyframes.length === 1) return keyframes[0].value;

    // Find surrounding keyframes
    let prevKey = keyframes[0];
    let nextKey = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
        prevKey = keyframes[i];
        nextKey = keyframes[i + 1];
        break;
      }
    }

    // Interpolate between keyframes
    const localProgress = (progress - prevKey.time) / (nextKey.time - prevKey.time);
    return prevKey.value + (nextKey.value - prevKey.value) * localProgress;
  }

  /**
   * Interpolate color using gradient
   */
  static interpolateColor(
    gradient: ColorGradient,
    progress: number
  ): ColorLike {
    if (gradient.keyframes.length === 0) {
      return { r: 255, g: 255, b: 255 };
    }
    
    if (gradient.keyframes.length === 1) {
      return gradient.keyframes[0].color;
    }

    // Find surrounding keyframes
    let prevKey = gradient.keyframes[0];
    let nextKey = gradient.keyframes[gradient.keyframes.length - 1];

    for (let i = 0; i < gradient.keyframes.length - 1; i++) {
      if (progress >= gradient.keyframes[i].time && 
          progress <= gradient.keyframes[i + 1].time) {
        prevKey = gradient.keyframes[i];
        nextKey = gradient.keyframes[i + 1];
        break;
      }
    }

    // Interpolate between colors
    const localProgress = (progress - prevKey.time) / (nextKey.time - prevKey.time);
    
    if (gradient.type === 'smooth') {
      // Smooth interpolation with easing
      const t = localProgress < 0.5 
        ? 2 * localProgress * localProgress 
        : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;
      
      return {
        r: Math.round(prevKey.color.r + (nextKey.color.r - prevKey.color.r) * t),
        g: Math.round(prevKey.color.g + (nextKey.color.g - prevKey.color.g) * t),
        b: Math.round(prevKey.color.b + (nextKey.color.b - prevKey.color.b) * t)
      };
    } else {
      // Linear interpolation
      return {
        r: Math.round(prevKey.color.r + (nextKey.color.r - prevKey.color.r) * localProgress),
        g: Math.round(prevKey.color.g + (nextKey.color.g - prevKey.color.g) * localProgress),
        b: Math.round(prevKey.color.b + (nextKey.color.b - prevKey.color.b) * localProgress)
      };
    }
  }

  /**
   * Convert degrees to radians
   */
  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Apply easing function
   */
  static ease(t: number, type: 'in' | 'out' | 'inOut' = 'inOut'): number {
    switch (type) {
      case 'in':
        return t * t;
      case 'out':
        return 1 - Math.pow(1 - t, 2);
      case 'inOut':
        return t < 0.5 
          ? 2 * t * t 
          : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
  }
}