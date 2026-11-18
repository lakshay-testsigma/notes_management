import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The app is a static site. `npm run build` writes the whole thing to dist/.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    // The unit tests run in Node. The files under tests/integration ask for
    // jsdom with a `@vitest-environment` line at the top of the file.
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
