import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: [
      'server/tests/registration.test.js',
      'server/tests/login.test.js',
      'client/src/**/*.test.jsx',
    ],
    environment: 'node',
  },
});
