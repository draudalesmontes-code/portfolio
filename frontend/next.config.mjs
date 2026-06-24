import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // let .md/.mdx files be treated as pages/routes
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({});

// wrap the config so Next can compile MDX
export default withMDX(nextConfig);
