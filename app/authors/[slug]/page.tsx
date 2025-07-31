// app/authors/[slug]/page.tsx - Author biography page

'use client'

import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import { urlFor } from '@/lib/sanity'
import { useState, useEffect, useMemo } from 'react'

interface Author {
  _id: string
  name: string
  slug: { current: string }
  jobTitle?: string
  bio?: any[]
  expertise?: string[]
  socialMedia?: {
    twitter?: string
    linkedin?: string
    website?: string
  }
  image?: {
    asset?: { url: string }
    alt?: string
  }
}

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
}

interface SearchFAQ {
  _id: string;
  question: string;
  slug: { current: string };
  summaryForAI?: string;
}

// Type for query parameters
interface AuthorQueryParams {
  slug: string;
}

interface AuthorFaqsQueryParams {
  authorId: string;
}

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

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export default function AuthorPage({ params }: AuthorPageProps) {
  const [slug, setSlug] = useState<string>('');
  const [author, setAuthor] = useState<Author | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchFAQs, setSearchFAQs] = useState<SearchFAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(resolvedParams => {
      setSlug(resolvedParams.slug);
      fetchAuthorData(resolvedParams.slug);
    });
  }, [params]);

  const fetchAuthorData = async (authorSlug: string) => {
    try {
      // Use string interpolation to avoid TypeScript parameter issues
      const authorQueryDynamic = `*[_type == "author" && slug.current == "${authorSlug}"][0] {
        _id,
        name,
        slug,
        jobTitle,
        bio,
        expertise,
        socialMedia,
        image {
          asset->{
            _id,
            url
          },
          alt
        }
      }`;

      const [authorData, searchFAQsData] = await Promise.allSettled([
        client.fetch(authorQueryDynamic),
        client.fetch(searchFAQsQuery)
      ]);

      if (authorData.status !== 'fulfilled' || !authorData.value) {
        notFound();
        return;
      }
      
      setAuthor(authorData.value);
      setSearchFAQs(searchFAQsData.status === 'fulfilled' ? searchFAQsData.value || [] : []);
      
      // Fetch author's FAQs using the author ID
      const authorFaqsQueryDynamic = `*[_type == "faq" && author._ref == "${authorData.value._id}" && defined(slug.current)] | order(publishedAt desc, _createdAt desc) {
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
      }`;

      const authorFaqs = await client.fetch(authorFaqsQueryDynamic);
      setFaqs(authorFaqs || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching author data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading author profile...</p>
        </div>
      </div>
    );
  }

  if (!author) {
    notFound();
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* SEO Structured Data for Author Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "@id": `https://upffaqs.com/authors/${slug}`,
            "url": `https://upffaqs.com/authors/${slug}`,
            "name": `${author.name} - UPF FAQs Author`,
            "description": `Learn about ${author.name}, ${author.jobTitle || 'contributor'} at UPF FAQs. Read their ultra-processed food questions and answers.`,
            "inLanguage": "en-US",
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://upffaqs.com/#website",
              "url": "https://upffaqs.com",
              "name": "UPF FAQs"
            },
            "mainEntity": {
              "@type": "Person",
              "@id": `https://upffaqs.com/authors/${slug}#person`,
              "name": author.name,
              "url": `https://upffaqs.com/authors/${slug}`,
              ...(author.jobTitle && { "jobTitle": author.jobTitle }),
              ...(author.image?.asset?.url && {
                "image": {
                  "@type": "ImageObject",
                  "url": getImageUrl(author.image, 400, 400)
                }
              }),
              ...(author.socialMedia?.website && { "url": author.socialMedia.website }),
              ...(author.socialMedia && {
                "sameAs": [
                  author.socialMedia.twitter && `https://twitter.com/${author.socialMedia.twitter.replace('@', '')}`,
                  author.socialMedia.linkedin && author.socialMedia.linkedin,
                  author.socialMedia.website && author.socialMedia.website
                ].filter(Boolean)
              })
            }
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
          <span className="text-slate-800 font-medium">Authors</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-800 font-medium">{author.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow mx-auto px-4 sm:px-6 lg:px-8 pb-16" style={{ maxWidth: '1600px' }}>
        {/* Author Profile Section */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-12">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Author Image */}
              {author.image?.asset?.url && (
                <div className="flex-shrink-0">
                  <Image
                    src={getImageUrl(author.image, 200, 200)}
                    alt={author.image.alt || author.name}
                    width={200}
                    height={200}
                    className="rounded-2xl shadow-lg"
                    onError={(e) => {
                      console.error('Author image failed to load');
                    }}
                  />
                </div>
              )}

              {/* Author Details */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                    {author.name}
                  </h1>
                  {author.jobTitle && (
                    <p className="text-lg text-orange-600 font-medium mb-4">
                      {author.jobTitle}
                    </p>
                  )}
                  
                  {/* FAQs count */}
                  <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} authored
                  </div>
                </div>

                {/* Bio */}
                {author.bio && (
                  <div className="prose prose-lg prose-slate max-w-none mb-6">
                    <PortableText value={author.bio} />
                  </div>
                )}

                {/* Expertise */}
                {author.expertise && author.expertise.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Areas of Expertise:</h3>
                    <div className="flex flex-wrap gap-2">
                      {author.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media Links */}
                {author.socialMedia && (
                  <div className="flex gap-4">
                    {author.socialMedia.website && (
                      <a
                        href={author.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                        Website
                      </a>
                    )}
                    {author.socialMedia.linkedin && (
                      <a
                        href={author.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {author.socialMedia.twitter && (
                      <a
                        href={`https://twitter.com/${author.socialMedia.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        @{author.socialMedia.twitter.replace('@', '')}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Author's FAQs Section */}
        {faqs.length > 0 && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Questions by {author.name}
              </h2>
              <p className="text-slate-600 text-lg">
                {faqs.length} UPF question{faqs.length !== 1 ? 's' : ''} answered by this author
              </p>
            </div>

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
                              By {author.name}
                            </span>
                          </div>
                          
                          <h3 className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-orange-200 transition-colors duration-300">
                            {faq.question}
                          </h3>
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

                      {/* Date and tags */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        {faq.publishedAt && (
                          <time dateTime={faq.publishedAt}>
                            {new Date(faq.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        )}
                        {faq.category && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                            {faq.category.title}
                          </span>
                        )}
                      </div>

                      {/* Keywords */}
                      {faq.keywords && faq.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {faq.keywords.slice(0, 3).map((keyword, index) => (
                            <Link
                              key={index}
                              href={`/tags/${encodeURIComponent(keyword.toLowerCase().replace(/\s+/g, '-'))}`}
                              className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs hover:bg-orange-200 transition-colors duration-200"
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
          </section>
        )}

        {/* No FAQs state */}
        {faqs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No FAQs Yet</h3>
            <p className="text-slate-500">
              {author.name} hasn't authored any UPF questions yet. Check back later!
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