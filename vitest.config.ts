import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// tsconfig の paths（@/* → ./src/*）と同じ別名を Vitest にも教える
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
