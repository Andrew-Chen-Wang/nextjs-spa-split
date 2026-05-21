import babel from "@rolldown/plugin-babel"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: "/",
  plugins: [
    tanstackRouter({ quoteStyle: "double" }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    port: 3001,
  },
})
