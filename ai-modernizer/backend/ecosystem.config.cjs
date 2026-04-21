module.exports = {
  apps: [
    {
      name: 'ai-modernizer-backend',
      script: './server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 3100
      }
    }
  ]
};
