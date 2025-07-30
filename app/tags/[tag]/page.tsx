// app/tags/[tag]/page.tsx - Tag archive page

'use client'

import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { urlFor } from '@/lib/sanity'
import { useState, useEffect, useMemo } from 'react'

interface FAQ {
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
  author?: {
    name: string;
    slug: { current: string };
  };
}

interface SearchFAQ {
  _id: string;
  question: string;
  slug: { current: string };
  summaryForAI?: string;
}

// Query to get FAQs by tag/keyword
const tagFaqsQuery = groq`*[_type == "faq" && $tag in keywords[] && defined(slug.current)] | order(publishedAt desc, _createdAt desc) {
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
  publishedAt,
  author->{
    name,
    slug
  }
}`;

// Search FAQs query for the search box
const searchFAQsQuery = groq`*[_type == "faq" && defined(slug.current) && defined(question)] {
  _id,
  question,
  slug,
  summaryForAI
}`;

// Universal image URL function
const getImageUrl = (image: any, width?: number, height?: number, fallback = '/fallback.jpg') => {
  if (!image?.asset?.url) {
    return fallback;
  }

  try {
    if (width && height) {
      return urlFor(image).width(width).height(height).fit('crop').url();
    } else if (width) {
      return urlFor(image).width(width).url();
    } else {
      return urlFor(image).url();
    }
  } catch (error) {
    console.warn('urlFor failed, using raw URL:', error);
    return image.asset.url;
  }
};

// Search Component - Orange themed for UPF
const FAQPageSearch = ({ searchFAQs }: { searchFAQs: SearchFAQ[] }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const searchTerm = query.toLowerCase();
    const validFaqs = searchFAQs.filter(faq => 
      faq && 
      faq.slug && 
      faq.slug.current && 
      faq.question
    );
    
    return validFaqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm) ||
      faq.summaryForAI?.toLowerCase().includes(searchTerm)
    ).slice(0, 5);
  }, [query, searchFAQs]);

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
        : part
    );
  };

  return (
    <div className="relative max-w-xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm transition-all duration-200"
          placeholder="Search other UPF questions..."
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-4 w-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-80 overflow-y-auto">
          {searchResults.length > 0 ? (
            <>
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-700">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="py-1">
                {searchResults
                  .filter(faq => faq && faq.slug && faq.slug.current && faq.question)
                  .map((faq) => (
                  <Link
                    key={faq._id}
                    href={`/faqs/${faq.slug.current}`}
                    className="block px-4 py-2 hover:bg-orange-50 transition-colors duration-150"
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-100 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-slate-800 leading-snug mb-1 text-sm">
                          {highlightText(faq.question, query.trim())}
                        </h4>
                        {faq.summaryForAI && (
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {highlightText(faq.summaryForAI, query.trim())}
                          </p>
                        )}
                      </div>
                      <svg className="w-3 h-3 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.347 0-4.518.641-6.397 1.759" />
                </svg>
              </div>
              <h4 className="font-medium text-slate-800 mb-1 text-sm">No results found</h4>
              <p className="text-xs text-slate-600">
                No UPF FAQs match "{query}"
              </p>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export default function TagPage({ params }: TagPageProps) {
  const [tag, setTag] = useState<string>('');
  const [displayTag, setDisplayTag] = useState<string>('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchFAQs, setSearchFAQs] = useState<SearchFAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(resolvedParams => {
      const urlTag = decodeURIComponent(resolvedParams.tag);
      setTag(urlTag);
      
      // Convert URL-friendly tag back to display format
      const displayVersion = urlTag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      setDisplayTag(displayVersion);
      
      fetchTagData(displayVersion);
    });
  }, [params]);

  const fetchTagData = async (tagName: string) => {
    try {
      const [tagFaqs, searchFAQsData] = await Promise.allSettled([
        client.fetch(tagFaqsQuery, { tag: tagName }),
        client.fetch(searchFAQsQuery)
      ]);

      if (tagFaqs.status === 'fulfilled') {
        setFaqs(tagFaqs.value || []);
      }
      
      setSearchFAQs(searchFAQsData.status === 'fulfilled' ? searchFAQsData.value || [] : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tag data:', error);
      setLoading(false);
    }
  };

  // If no FAQs found for this tag, show 404
  if (!loading && faqs.length === 0) {
    notFound();
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tag archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* SEO Structured Data for Tag Archive */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `https://upffaqs.com/tags/${encodeURIComponent(tag)}`,
            "url": `https://upffaqs.com/tags/${encodeURIComponent(tag)}`,
            "name": `${displayTag} - UPF FAQs`,
            "description": `All UPF FAQ questions and answers about ${displayTag}. Find comprehensive information about ultra-processed foods related to ${displayTag}.`,
            "inLanguage": "en-US",
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://upffaqs.com/#website",
              "url": "https://upffaqs.com",
              "name": "UPF FAQs"
            },
            "mainEntity": faqs.slice(0, 10).map((faq) => ({
              "@type": "Question",
              "name": faq.question,
              "url": `https://upffaqs.com/faqs/${faq.slug.current}`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.summaryForAI || "Detailed answer available on the page."
              }
            }))
          })
        }}
      />

      {/* Header Section */}
      <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto text-center" style={{ maxWidth: '1600px' }}>
          <Link href="/" className="inline-block">
            <Image
              src="/upffaqs.png"
              alt="UPF FAQs"
              width={400}
              height={120}
              className="mx-auto mb-4"
            />
          </Link>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
            Quick answers to your ultra-processed food questions
          </p>
          
          <div className="mb-6">
            <FAQPageSearch searchFAQs={searchFAQs} />
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumbs */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 mb-8" style={{ maxWidth: '1600px' }}>
        <div className="flex items-center gap-4 text-sm">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group font-medium"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to hub
          </Link>
          <span className="text-slate-400">•</span>
          <Link 
            href="/faqs" 
            className="text-slate-600 hover:text-slate-800 transition-colors duration-200 font-medium"
          >
            All FAQs
          </Link>
          <span className="text-slate-400">•</span>
          <span className="text-slate-800 font-medium">#{displayTag}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow mx-auto px-4 sm:px-6 lg:px-8 pb-16" style={{ maxWidth: '1600px' }}>
        {/* Tag Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-lg mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">#{displayTag}</h1>
              <p className="text-slate-600">
                {faqs.length} question{faqs.length !== 1 ? 's' : ''} about this topic
              </p>
            </div>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            All UPF questions and answers related to <strong>{displayTag}</strong>
          </p>
        </div>

        {/* FAQs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {faqs.map((faq, index) => {
            const imageUrl = getImageUrl(faq.image, 500, 300);

            return (
              <article
                key={faq._id}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <Link
                  href={`/faqs/${faq.slug.current}`}
                  className="block relative overflow-hidden group"
                >
                  <div className="relative h-64 md:h-72 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={faq.image?.alt || faq.question}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          #{displayTag}
                        </span>
                      </div>
                      
                      <h2 className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-orange-200 transition-colors duration-300">
                        {faq.question}
                      </h2>
                    </div>
                    
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </Link>

                <div className="p-6 md:p-8">
                  {faq.summaryForAI && (
                    <p className="text-slate-600 leading-relaxed line-clamp-3 mb-4">
                      {faq.summaryForAI}
                    </p>
                  )}

                  {/* Author and date */}
                  {faq.author && (
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <Link 
                        href={`/authors/${faq.author.slug.current}`}
                        className="hover:text-orange-600 transition-colors duration-200"
                      >
                        By {faq.author.name}
                      </Link>
                      {faq.publishedAt && (
                        <time dateTime={faq.publishedAt}>
                          {new Date(faq.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      )}
                    </div>
                  )}

                  {/* Other tags */}
                  {faq.keywords && faq.keywords.length > 1 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {faq.keywords
                        .filter(keyword => keyword !== displayTag)
                        .slice(0, 3)
                        .map((keyword, index) => (
                        <Link
                          key={index}
                          href={`/tags/${encodeURIComponent(keyword.toLowerCase().replace(/\s+/g, '-'))}`}
                          className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200"
                        >
                          #{keyword}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/faqs/${faq.slug.current}`}
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm group/link transition-colors duration-200"
                  >
                    Read full answer
                    <svg 
                      className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>

                <div className="absolute inset-0 rounded-3xl ring-1 ring-slate-200/50 group-hover:ring-orange-300/50 transition-colors duration-300 pointer-events-none" />
              </article>
            )
          })}
        </div>

        {/* Load More or Pagination could go here */}
        {faqs.length > 12 && (
          <div className="text-center mt-12">
            <p className="text-slate-600">
              Showing all {faqs.length} questions about <strong>#{displayTag}</strong>
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-orange-50 border-t border-orange-200 py-6 mt-auto">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ maxWidth: '1600px' }}>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-2">
            <span>Powered by</span>
            <Image
              src="/upsum.png"
              alt="Upsum"
              width={60}
              height={24}
              className="opacity-70"
            />
          </div>
          <p className="text-xs text-slate-400">
            Upsum is a trademark of{' '}
            <a 
              href="https://harpoon.productions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-600 transition-colors duration-200"
            >
              Harpoon Productions
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}