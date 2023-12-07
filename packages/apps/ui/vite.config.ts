import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const config = {
		plugins: [react()],
		build: {
			chunkSizeWarningLimit: 2000
		},
		server: {
			fs: {
				// Allow serving files from one level up to the project root
				allow: ['../../..']
			}
		},
		optimizeDeps: {
			exclude: ['csv-parse']
		},
		define: {} as any
	};

	if (mode === 'development') {
		config.define.global = {};
	}

	return config;
});
