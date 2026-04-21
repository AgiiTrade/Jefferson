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
        PORT: 3100,
        JWT_SECRET: 'K4dl_pp8zMaLzpgI9AoZ5Ij5ekrEW9ij3rn7F8qnHfyX5tw_oy-0PR3N8Cs3jb86',
        ALLOWED_ORIGINS: 'https://agiitrade.github.io,http://localhost:3100,http://127.0.0.1:3100'
      }
    }
  ]
};
