import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement du fichier .env ou de l'interface Netlify
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Injection sécurisée de la clé API
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});