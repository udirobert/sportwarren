const path = require('path');

module.exports = {
  apps: [
    {
      name: 'sportwarren-api',
      script: '.next/standalone/server.js',
      cwd: __dirname,
      args: '--port 5200',
      interpreter: 'node',
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      kill_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: '5200',
        // sharp's native addon dlopen()s libvips as a genuinely separate
        // shared object (unlike @resvg/resvg-js's statically-linked Rust
        // binary) — the OS dynamic linker doesn't go through Node's module
        // resolution to find it. build-runtime-artifact.sh injects the .so
        // here; CI's smoke test and this production process both need the
        // identical export to load sharp.
        LD_LIBRARY_PATH: path.join(__dirname, '.next/standalone/node_modules/@img/sharp-libvips-linux-x64/lib'),
      },
    },
  ],
};
