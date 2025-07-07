import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import groq from 'groq'

const query = groq`
  *[_type == "faq"] | order(publishedAt desc) {
    _id,
    question,
    slug,
    summaryForAI,
    tags,
    image {
      asset->{
        _id,
        url
      }
    }
  }
`

export async function GET() {
  const faqs = await client.fetch(query)
  return NextResponse.json(faqs)
}
