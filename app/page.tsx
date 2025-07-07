// app/page.tsx - Simple working version
'use client'

import { useState, useEffect } from 'react'
import { client } from '@/lib/sanity'
import groq from 'groq'

export default function HomePage() {
  const [faqs, setFaqs] = useState([])

  useEffect(() => {
    client.fetch(groq`*[_type == "faq"][0...5]{_id, question, slug}`)
      .then(setFaqs)
      .catch(console.error)
  }, [])

  return (
    <div>
      <h1>UPF FAQs</h1>
      {faqs.map(faq => (
        <div key={faq._id}>
          <h2>{faq.question}</h2>
        </div>
      ))}
    </div>
  )
}