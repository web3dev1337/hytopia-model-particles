# Key Decisions & Solutions

## Pool Size
- Started with 1000, reduced to 200 for performance
- Configurable via maxPoolSize parameter

## Physics Handling
- **Problem**: CCD causing tunneling when teleporting particles
- **Solution**: Disable CCD, use physics.disable() when parking

## Velocity Application
- **Problem**: Velocities not applying correctly from pool
- **Solution**: Apply velocities immediately in activate(), not in reset()

## Position Management
- **Problem**: Rust aliasing errors with position getter
- **Solution**: Use entity.setPosition() directly, cache positions

## Pool Building
- **Problem**: Creating 1000 entities at once causes lag
- **Solution**: Gradual building - 10 entities per tick

## Recent Debug Sessions
- Added detailed tracking for first particle in pool
- Enhanced physics property logging
- Fixed undefined property access in debug code