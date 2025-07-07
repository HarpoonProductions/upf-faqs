'use client'

import { useState, useEffect } from 'react'
import { client } from '@/lib/sanity'
import groq from 'groq'

interface FAQ {
  _id: string;
  question: string;
  slug: { current: string };
}

export default function HomePage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])

  useEffect(() => {
    client.fetch(groq`*[_type == "faq"][0...5]{_id, question, slug}`)
      .then(setFaqs)
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">UPF FAQs</h1>
      <div className="max-w-4xl mx-auto">
        {faqs.map(faq => (
          <div key={faq._id} className="bg-white p-6 mb-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{faq.question}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}
