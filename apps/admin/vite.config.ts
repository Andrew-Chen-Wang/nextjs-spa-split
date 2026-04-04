import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: "/admin/",
  plugins: [tanstackRouter({ quoteStyle: "double" }), react()],
  server: {
    port: 3002,
  },
})
