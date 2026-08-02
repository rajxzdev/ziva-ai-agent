/** @type {import('next').NextConfig} */
const nextConfig = {
  // 100% LOKAL — tanpa server & tanpa backend.
  // `npm run build` menghasilkan folder /out berisi HTML/CSS/JS statis murni.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
