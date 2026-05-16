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
      },
    },
  ],
};
