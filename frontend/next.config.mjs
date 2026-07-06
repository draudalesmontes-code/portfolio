import createMDX from "@next/mdx";
import path from "node:path";
import { fileURLToPath } from "node:url";

const coreApiProxyBase =
  process.env.CORE_API_PROXY_BASE ?? "http://localhost/api";
const aiServiceProxyBase =
  process.env.AI_SERVICE_PROXY_BASE ?? "http://localhost/ai";
const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  turbopack: {
    root: frontendRoot,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${coreApiProxyBase}/:path*`,
      },
      {
        source: "/ai/:path*",
        destination: `${aiServiceProxyBase}/:path*`,
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
