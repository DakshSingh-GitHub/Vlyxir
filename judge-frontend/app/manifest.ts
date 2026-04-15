import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'VLYXIR',
        short_name: 'VLYXIR',
        description: 'VLYXIR — A platform for online coding challenges and judge.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0B0C15',
        theme_color: '#0B0C15',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
