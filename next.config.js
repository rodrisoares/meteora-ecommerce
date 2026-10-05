/** @type {import('next').NextConfig} */
const nextConfig = {
  // Imagens servidas localmente a partir de `public/assets` — sem necessidade
  // de `images.remotePatterns` (nenhuma imagem remota é carregada).
  images: {
    // Qualidades permitidas para next/image. Categorias usa quality={100}.
    // A partir do Next 16 esta lista passa a ser obrigatória (75 é o padrão).
    qualities: [75, 100],
  },
};

export default nextConfig;
