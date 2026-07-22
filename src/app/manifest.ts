import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TS Boat Tourism',
    short_name: 'TS Boat Tourism',
    description: 'Book the best Papikondalu tours, Bhadrachalam travel packages, Godavari river cruises, and premium stays.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9F9F7',
    theme_color: '#0F3D56',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
