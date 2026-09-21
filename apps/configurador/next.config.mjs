/** @type {import('next').NextConfig} */

// No GitHub Pages o site mora em /Matheus-Performance/configurador, não na
// raiz do domínio. O workflow passa esse prefixo; em desenvolvimento fica
// vazio e tudo serve de "/".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig = {
  // Site 100% estático: todo o configurador roda no cliente.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
