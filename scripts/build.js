#!/usr/bin/env node

/**
 * Simple build script to copy files from src to lib
 */

const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const libDir = path.join(__dirname, '..', 'lib');

async function build() {
  console.log('Building lightbox-image-plugin...');
  
  try {
    // Clean lib directory
    await fs.remove(libDir);
    
    // Copy all files from src to lib
    await fs.copy(srcDir, libDir);
    
    console.log('✓ Build complete!');
  } catch (error) {
    console.error('✗ Build failed:', error);
    process.exit(1);
  }
}

build();