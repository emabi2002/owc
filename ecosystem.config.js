// PM2 process configuration for OWC PNG.
// Usage on the server:
//   pm2 start ecosystem.config.js
//   pm2 reload ecosystem.config.js --update-env
//   pm2 save && pm2 startup
//
// Next.js reads environment variables from .env.local at runtime, so secrets
// live in that (git-ignored) file alongside the app — not in this file.
module.exports = {
  apps: [
    {
      name: "owc-png",
      cwd: __dirname,
      script: "bun",
      args: "run start",
      interpreter: "none",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "0.0.0.0",
      },
      out_file: "./.same/pm2-out.log",
      error_file: "./.same/pm2-error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
