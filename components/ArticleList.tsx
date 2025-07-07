'use client'

import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default function ArticleList({ articles }: { articles: any[] }) {
  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => {
          const imageUrl = article.image?.asset?.url
            ? urlFor(article.image).width(400).height(250).fit('crop').url()
            : '/fallback.jpg'

          return (
            <Link
              href={`/articles/${article.slug.current}`}
              key={article._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
            >
              <div className="relative w-full h-48">
                <Image
                  src={imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-gray-600 text-sm line-clamp-3">{article.summary}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}