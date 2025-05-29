import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
const { withClerkMiddleware } = require("@clerk/nextjs/server");
module.exports = withClerkMiddleware({
  // tu config original aquí
});

export default nextConfig;
