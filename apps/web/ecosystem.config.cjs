module.exports = {
  apps: [
    {
      name: 'lockfi-api',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/home/ubuntu/lockfi/apps/web',
      node_args: '--experimental-sqlite',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--experimental-sqlite',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
}
