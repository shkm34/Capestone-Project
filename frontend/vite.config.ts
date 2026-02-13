import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// Vite config
// - `react` plugin: enables JSX/TSX, fast refresh, React optimizations.
// - `tailwindcss` plugin: turns Tailwind's CSS-first approach into utilities at build time.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});

