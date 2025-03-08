#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const command = process.argv[2];
  const flags = {};
  for (let i = 3; i < process.argv.length; i += 2) {
    if (i % 2 === 1) { // Odd indices are flags
      const flag = process.argv[i].replace('--', '');
      const value = process.argv[i + 1];
      flags[flag] = value;
    }
  }

  /**
   * Init command
   * 
   * Initializes a new HYTOPIA project. Accepting an optional
   * project name as an argument.
   * 
   * @example
   * `bunx hytopia init my-project-name`
   */
  if (command === 'init') {
    const destDir = process.cwd();

    // Grab the latest dependencies
    execSync('bun init --yes');
    execSync('bun add hytopia@latest');
    execSync('bun add @hytopia.com/assets');

    // Initialize project with latest HYTOPIA SDK
    console.log('🔧 Initializing project with latest HYTOPIA SDK...');
   
    if (flags.template) {
      // Init from example template
      console.log(`🖨️ Initializing project with examples template "${flags.template}"...`);

      const templateDir = path.join(destDir, 'node_modules', 'hytopia', 'examples', flags.template);

      if (!fs.existsSync(templateDir)) {
        console.error(`Examples template ${flags.template} does not exist in the examples directory, could not initialize project! Tried directory: ${templateDir}`);
        return;
      }

      fs.cpSync(templateDir, destDir, { recursive: true });

      execSync('bun install');
    } else {
      // Init from boilerplate
      console.log('🧑‍💻 Initializing project with boilerplate...');

      const srcDir = path.join(__dirname, '..', 'boilerplate');
      
      fs.cpSync(srcDir, destDir, { recursive: true });  
    }

    // Copy assets into project, not overwriting existing files
    fs.cpSync(
      path.join(destDir, 'node_modules', '@hytopia.com', 'assets'),
      path.join(destDir, 'assets'),
      { recursive: true, force: false }
    );

    // Done, lfg!
    console.log('--------------------------------');
    console.log('🚀 Hytopia project initialized successfully!');
    console.log('💡 Start your development server with `bun --watch index.ts`!');
    console.log('🎮 After you start your development server, play by opening your browser and visiting: https://play.hytopia.com/?join=localhost:8080')
    return;
  }
  
  console.log('Unknown command: ' + command);
})();

