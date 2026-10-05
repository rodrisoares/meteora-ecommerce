import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Runtime automático de JSX (React 17+): permite testar componentes/contexts
  // que usam JSX sem importar React explicitamente (padrão do Next/React 19).
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.js"],
    include: ["**/*.test.{js,jsx}"],
    exclude: ["node_modules", ".next"],
  },
});
