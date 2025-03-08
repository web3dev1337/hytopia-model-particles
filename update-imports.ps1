# Update import paths
$files = Get-ChildItem -Path "src" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Update imports based on new structure
    $content = $content -replace 'from ''\./(Particle)''', 'from ''../core/$1'''
    $content = $content -replace 'from ''\./(ParticleEmitter)''', 'from ''../core/$1'''
    $content = $content -replace 'from ''\./(ParticlePool)''', 'from ''../core/$1'''
    $content = $content -replace 'from ''\./(PhysicsController)''', 'from ''../physics/$1'''
    $content = $content -replace 'from ''\./(SpatialGrid)''', 'from ''../physics/$1'''
    $content = $content -replace 'from ''\./(ParticleLifecycleManager)''', 'from ''../lifecycle/$1'''
    $content = $content -replace 'from ''\./(ParticleEffectQueue)''', 'from ''../lifecycle/$1'''
    $content = $content -replace 'from ''\./(ParticleDataBuffer)''', 'from ''../data/$1'''
    $content = $content -replace 'from ''\./(ParticleConfigLoader)''', 'from ''../config/$1'''
    $content = $content -replace 'from ''\./(utils)''', 'from ''../utils/$1'''
    $content = $content -replace 'from ''\./(types)''', 'from ''../types'''
    $content = $content -replace 'from ''\./(plugin)''', 'from ''../plugin'''
    
    # Update pattern imports
    $content = $content -replace 'from ''\./(ParticlePatternsRegistry)''', 'from ''../patterns/$1'''
    $content = $content -replace 'from ''\./(basePattern)''', 'from ''../patterns/base/$1'''
    $content = $content -replace 'from ''\./(explosionPattern)''', 'from ''../patterns/built-in/$1'''
    $content = $content -replace 'from ''\./(sparkPattern)''', 'from ''../patterns/built-in/$1'''
    $content = $content -replace 'from ''\./(streamPattern)''', 'from ''../patterns/built-in/$1'''

    # Save changes
    $content | Set-Content $file.FullName -NoNewline
} 