import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'shxuue68',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-05-03',
})

// Export for legacy compatibility
export const sanity = client

// Image URL builder
const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)

// extra push for change //
