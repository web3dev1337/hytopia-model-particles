# Hytopia Model Particles Guidelines

## 🚨 FIRST STEPS 🚨
```bash
git fetch origin master:master
git checkout -b feature/name master
# OR if master checked out elsewhere:
git fetch origin master && git checkout -b feature/name origin/master
```

**NEVER**: commit to master or skip PR creation
**CHECK**: If on existing branch, verify it matches your current task (check ai-memory folder)

## 🚨 READ THESE 🚨
1. CODEBASE_DOCUMENTATION.md - Technical architecture reference
2. src/ParticleSystemV2.ts - Main v2 system implementation
3. src/core/Particle.ts - Core particle entity class
4. ai-memory/*/init.md - Original feature requirements

## Overview
High-performance particle system for Hytopia game engine with:
- True entity pooling (v2.3) for optimal performance
- Physics-based particle behaviors
- YAML-configurable effects
- Multiple pattern types (explosion, fountain, spiral, etc.)
- Performance monitoring and optimization

## Code Style
- TypeScript with strict typing
- Clear separation of concerns (core, patterns, physics, optimization)
- Comprehensive JSDoc comments for public APIs
- Consistent naming: camelCase for variables/functions, PascalCase for classes

## Testing
```bash
npm run build     # Build the library
npm run example   # Run the showcase example
```

Test files:
- examples/v2.1-showcase.ts - Main testing showcase
- examples/effects/v2.1-effects.yaml - Effect configurations

## Commands
```bash
npm run build     # Build TypeScript to dist/
npm run example   # Run showcase example
npm run watch     # Watch mode for development
```

## Architecture
- **Entity Pooling**: Pre-creates and reuses particle entities
- **Physics Integration**: Uses Hytopia's physics engine
- **Pattern System**: Modular pattern implementations
- **Performance**: Built-in monitoring and optimization
- **Queue System**: Manages effect scheduling

## Key Patterns
1. **Object Pooling**: ParticlePool manages entity lifecycle
2. **Strategy Pattern**: Different particle patterns (explosion, fountain, etc.)
3. **Observer Pattern**: Performance monitoring
4. **Factory Pattern**: Pattern registry and creation

## Gotchas
1. **Physics CCD**: Disabled to prevent tunneling with pooled particles
2. **Pool Size**: Default 200, configurable via maxPoolSize
3. **Gradual Pool Building**: Creates 10 entities per tick to avoid lag
4. **Position Caching**: Use entity.setPosition() to avoid Rust aliasing
5. **Velocity Application**: Apply immediately in activate(), not reset()

## Current Version
v2.3.0 - True Entity Pooling Implementation