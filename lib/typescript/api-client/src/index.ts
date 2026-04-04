import { client } from "./generated/client.gen"

export * from "./generated/client.gen"
export * from "./generated/types.gen"
export * from "./generated/sdk.gen"

client.setConfig({ baseUrl: process.env.NEXT_PUBLIC_HOST_URL })
