// app/page.tsx - UPF Homepage with Server-Side Rendering

import groq from 'groq'
import { client } from '@/lib/sanity'
import HomePage from '@/components/HomePage'

// Type definitions
export interface FAQ {
  _id: string;
  question: string;
  slug: { current: string };
  summaryForAI?: string;
  keywords?: string[];
  category?: { title: string };
  image?: {
    asset?: {
      url: string;
    };
    alt?: string;
  };
  publishedAt?: string;
}

export default async function Page() {
  // Server-side data fetching
  const faqs: FAQ[] = await client.fetch(groq`*[_type == "faq" && defined(slug.current)] | order(publishedAt desc, _createdAt desc)[0...10] {
    _id,
    question,
    slug,
    summaryForAI,
    keywords,
    category->{
      title
    },
    image {
      asset -> {
        url
      },
      alt
    },
    publishedAt
  }`);

  return <HomePage faqs={faqs} />;
}