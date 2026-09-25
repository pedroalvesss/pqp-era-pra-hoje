import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // o barrel do Phosphor tem milhares de ícones; pré-empacotar corta o tempo de import
    deps: { optimizer: { client: { enabled: true, include: ["@phosphor-icons/react"] } } },
  },
});
