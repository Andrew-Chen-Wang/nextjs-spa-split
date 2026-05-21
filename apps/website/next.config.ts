import * as path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@template-nextjs/db", "@ui/base", "@ui/seo-shared", "@lib/api-client"],
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
}

export default nextConfig
