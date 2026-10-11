/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Station logos come from thousands of different hosts, so they are
    // rendered with a plain <img> rather than next/image. Nothing to allow-list.
    unoptimized: true,
  },
};

export default nextConfig;
