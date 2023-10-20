import * as ChildProcess from "child_process";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { Express } from 'express';
import Rewrite from 'vite-plugin-rewrite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const gitHash = ChildProcess.execSync("git rev-parse HEAD").toString().trim();

  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd()),

    VITE_GIT_HASH: gitHash,
  };

  return {
    build: { target: "es2020" },

    server: {
      port: 8003,
      fs: { strict: false },
      proxy: {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      rewrites: [
        { from: /\/api/, to: 'http://localhost:3002' }
      ]
    },

    optimizeDeps: {
      esbuildOptions: {
        target: "es2020",
      },
    },

    plugins: [tsconfigPaths(), react({ jsxImportSource: "@emotion/react" })]
  };
});
