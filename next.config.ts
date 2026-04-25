import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* pdfkit carga .afm desde node_modules; si se bundlea, /api/report falla con 500 */
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
