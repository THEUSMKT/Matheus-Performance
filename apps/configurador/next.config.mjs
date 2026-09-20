/** @type {import('next').NextConfig} */
const nextConfig = {
  // Site 100% estático: todo o configurador roda no cliente.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
