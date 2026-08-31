import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pixelcraft.crack404.com';

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/playstore`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    }
  ];
}