import path from "node:path"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteStaticCopy } from "vite-plugin-static-copy"

const fontsourceFiles = (pkg: string) =>
  path.resolve(
    __dirname,
    `../../lib/typescript/ui/base/node_modules/@fontsource-variable/${pkg}/files/*.woff2`,
  )

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "https://d1i66hf38xpie.cloudfront.net/dashboard/" : "/",
  plugins: [
    tanstackRouter({ quoteStyle: "double" }),
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    viteStaticCopy({
      targets: [
        { src: fontsourceFiles("geist"), dest: "assets/files", rename: { stripBase: true } },
        { src: fontsourceFiles("geist-mono"), dest: "assets/files", rename: { stripBase: true } },
      ],
    }),
  ],
  server: {
    port: 3001,
  },
}))
