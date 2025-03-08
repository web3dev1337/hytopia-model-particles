import { PhysicsConfig, Vector3, Entity } from '../types';

export class PhysicsController {
  private config: PhysicsConfig;
  private entity: Entity;
  private time: number = 0;

  constructor(entity: Entity, config: PhysicsConfig) {
    this.entity = entity;
    this.config = config;
  }

  update(deltaTime: number): void {
    if (!this.config.enabled) return;
    
    this.time += deltaTime;
    this.applyForces(deltaTime);
    this.applyConstraints();
  }

  private applyForces(deltaTime: number): void {
    if (this.config.forces) {
      // Apply wind force if configured
      if (this.config.forces.wind) {
        const wind = this.config.forces.wind;
        const turbulence = wind.turbulence || 0;
        const turbulenceFactor = 1 + (Math.sin(this.time * 2) * turbulence);
        
        const windForce = {
          x: wind.direction.x * wind.strength * turbulenceFactor,
          y: wind.direction.y * wind.strength * turbulenceFactor,
          z: wind.direction.z * wind.strength * turbulenceFactor
        };
        
        this.applyForce(windForce, deltaTime);
      }

      // Apply vortex force if configured
      if (this.config.forces.vortex) {
        const vortex = this.config.forces.vortex;
        const dx = this.entity.position.x - vortex.center.x;
        const dy = this.entity.position.y - vortex.center.y;
        const dz = this.entity.position.z - vortex.center.z;
        
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance <= vortex.radius) {
          const strength = vortex.strength * (1 - distance / vortex.radius);
          const tangentialForce = {
            x: -dz * strength,
            y: 0,
            z: dx * strength
          };
          this.applyForce(tangentialForce, deltaTime);
        }
      }
    }

    // Apply gravity if enabled
    if (this.config.rigidBody?.useGravity) {
      const gravityScale = this.config.rigidBody.gravityScale || 1;
      const gravity = { x: 0, y: -9.81 * gravityScale, z: 0 };
      this.applyForce(gravity, deltaTime);
    }
  }

  private applyForce(force: Vector3, deltaTime: number): void {
    if (this.entity.rawRigidBody) {
      // Apply force through the physics engine
      this.entity.rawRigidBody.addForce(force);
    } else {
      // Simple velocity-based physics if no rigid body
      const mass = this.getMass();
      const acceleration = {
        x: force.x / mass,
        y: force.y / mass,
        z: force.z / mass
      };
      
      // v = v0 + at
      this.entity.velocity.x += acceleration.x * deltaTime;
      this.entity.velocity.y += acceleration.y * deltaTime;
      this.entity.velocity.z += acceleration.z * deltaTime;
    }
  }

  private applyConstraints(): void {
    if (!this.config.rigidBody) return;

    const options = this.config.rigidBody;
    
    if (this.entity.rawRigidBody) {
      // Apply constraints through physics engine
      if (options.linearDamping !== undefined) {
        this.entity.rawRigidBody.setLinearDamping(options.linearDamping);
      }
      if (options.angularDamping !== undefined) {
        this.entity.rawRigidBody.setAngularDamping(options.angularDamping);
      }
      if (options.fixedRotation !== undefined) {
        this.entity.rawRigidBody.setFixedRotation(options.fixedRotation);
      }
    }
  }

  private getMass(): number {
    if (this.entity.rawRigidBody) {
      return this.entity.rawRigidBody.getMass();
    }
    // Default mass based on material density or fallback value
    return (this.config.rigidBody?.material?.density || 1) * this.entity.modelScale;
  }

  // Public methods for external force application
  addForce(force: Vector3): void {
    this.applyForce(force, 0);
  }

  addExplosionForce(center: Vector3, force: number, radius: number): void {
    const dx = this.entity.position.x - center.x;
    const dy = this.entity.position.y - center.y;
    const dz = this.entity.position.z - center.z;
    
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance <= radius) {
      const strength = force * (1 - distance / radius);
      const direction = {
        x: dx / distance,
        y: dy / distance,
        z: dz / distance
      };
      
      this.applyForce({
        x: direction.x * strength,
        y: direction.y * strength,
        z: direction.z * strength
      }, 0);
    }
  }

  setVelocity(velocity: Vector3): void {
    if (this.entity.rawRigidBody) {
      this.entity.rawRigidBody.setLinearVelocity(velocity);
    } else {
      this.entity.velocity = { ...velocity };
    }
  }

  getVelocity(): Vector3 {
    if (this.entity.rawRigidBody) {
      return this.entity.rawRigidBody.getLinearVelocity();
    }
    return this.entity.velocity;
  }
} 