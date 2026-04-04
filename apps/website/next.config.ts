import * as path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@template-nextjs/db", "@ui/components", "@lib/api-client"],
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
}

export default nextConfig
