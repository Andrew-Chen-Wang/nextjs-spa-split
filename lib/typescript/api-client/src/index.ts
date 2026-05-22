import { client } from "./generated/client.gen"

export * from "./generated/client.gen"
export * from "./generated/types.gen"
export * from "./generated/sdk.gen"

export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://nextjs-spa-split.andrewcwang.com"

client.setConfig({ baseUrl, credentials: "include" })
