// components/SEO/FAQSchema.tsx - CREATE this as a NEW file for UPF
// You may need to create the SEO folder first: components/SEO/

import { urlFor } from '@/lib/sanity'

interface Author {
  _id: string
  name: string
  slug: { current: string }
  jobTitle?: string
  expertise?: string[]
  socialMedia?: {
    twitter?: string
    linkedin?: string
    website?: string
  }
  image?: {
    asset: { url: string }
    alt?: string
  }
}

interface Category {
  title: string
  slug: { current: string }
  description?: string
}

interface FAQ {
  _id: string
  question: string
  slug: { current: string }
  answer: any[]
  summaryForAI?: string
  alternateQuestions?: string[]
  keywords?: string[]
  category: Category
  relatedFAQs?: FAQ[]
  publishedAt: string
  updatedAt?: string
  author: Author
  image?: {
    asset: { url: string }
    alt?: string
    caption?: string
  }
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
  customSchemaMarkup?: string
}

interface SiteSettings {
  title: string
  description: string
  url: string
  logo?: {
    asset: { url: string }
    alt?: string
  }
  organization: {
    name: string
    alternateName?: string
    foundingDate?: string
    areaServed?: string
    knowsAbout?: string[]
  }
  socialMedia?: {
    twitter?: string
    linkedin?: string
    facebook?: string
  }
  searchAction?: {
    searchUrl?: string
  }
}

interface FAQSchemaProps {
  faq: FAQ
  siteSettings: SiteSettings
}

// Convert Portable Text to plain text
function portableTextToPlainText(blocks: any[]): string {
  return blocks
    .map(block => {
      if (block._type === 'block') {
        return block.children?.map((child: any) => child.text).join('') || ''
      }
      return ''
    })
    .join(' ')
    .trim()
}

export default function FAQSchema({ faq, siteSettings }: FAQSchemaProps) {
  // If custom schema markup is provided, use it
  if (faq.customSchemaMarkup) {
    try {
      const customSchema = JSON.parse(faq.customSchemaMarkup)
      return (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(customSchema, null, 2) }}
        />
      )
    } catch (error) {
      console.error('Invalid custom schema markup:', error)
    }
  }

  const pageUrl = `${siteSettings.url}/faqs/${faq.slug.current}`
  const answerText = portableTextToPlainText(faq.answer)

  // Get image URLs
  const featuredImageUrl = faq.image?.asset?.url 
    ? urlFor(faq.image).width(1200).height(600).fit('crop').url()
    : null

  const authorImageUrl = faq.author.image?.asset?.url
    ? urlFor(faq.author.image).width(200).height(200).fit('crop').url()
    : null

  const logoUrl = siteSettings.logo?.asset?.url
    ? urlFor(siteSettings.logo).width(200).height(60).fit('crop').url()
    : null

  // Build social media arrays
  const authorSameAs = []
  if (faq.author.socialMedia?.twitter) authorSameAs.push(faq.author.socialMedia.twitter)
  if (faq.author.socialMedia?.linkedin) authorSameAs.push(faq.author.socialMedia.linkedin)
  if (faq.author.socialMedia?.website) authorSameAs.push(faq.author.socialMedia.website)

  const organizationSameAs = []
  if (siteSettings.socialMedia?.twitter) organizationSameAs.push(siteSettings.socialMedia.twitter)
  if (siteSettings.socialMedia?.linkedin) organizationSameAs.push(siteSettings.socialMedia.linkedin)
  if (siteSettings.socialMedia?.facebook) organizationSameAs.push(siteSettings.socialMedia.facebook)

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      // FAQPage Entity
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faqpage`,
        "url": pageUrl,
        "name": faq.seo?.metaTitle || faq.question,
        "description": faq.seo?.metaDescription || faq.summaryForAI || `Expert answer about ultra-processed foods: ${faq.question}`,
        "inLanguage": "en-US",
        "datePublished": faq.publishedAt,
        "dateModified": faq.updatedAt || faq.publishedAt,
        "publisher": {
          "@type": "Organization",
          "@id": `${siteSettings.url}/#organization`
        },
        "mainEntity": [
          {
            "@type": "Question",
            "@id": `${pageUrl}#question1`,
            "name": faq.question,
            "text": faq.question,
            "answerCount": 1,
            "acceptedAnswer": {
              "@type": "Answer",
              "@id": `${pageUrl}#answer1`,
              "text": faq.summaryForAI || answerText.substring(0, 300) + "...",
              "author": {
                "@type": "Person",
                "@id": `${siteSettings.url}/authors/${faq.author.slug.current}#person`
              },
              "dateCreated": faq.publishedAt,
              "dateModified": faq.updatedAt || faq.publishedAt,
              "url": `${pageUrl}#answer1`
            }
          }
        ],
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".faq-question", ".faq-answer"]
        }
      },
      // Article Entity
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        "headline": faq.seo?.metaTitle || faq.question,
        "alternativeHeadline": faq.alternateQuestions?.[0] || faq.question,
        "description": faq.seo?.metaDescription || faq.summaryForAI || `Expert answer about ultra-processed foods: ${faq.question}`,
        ...(featuredImageUrl && {
          "image": {
            "@type": "ImageObject",
            "url": featuredImageUrl,
            "width": 1200,
            "height": 600,
            "caption": faq.image?.caption || faq.image?.alt || faq.question
          }
        }),
        "author": {
          "@type": "Person",
          "@id": `${siteSettings.url}/authors/${faq.author.slug.current}#person`
        },
        "publisher": {
          "@type": "Organization",
          "@id": `${siteSettings.url}/#organization`
        },
        "datePublished": faq.publishedAt,
        "dateModified": faq.updatedAt || faq.publishedAt,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${pageUrl}#webpage`
        },
        "articleSection": "FAQ",
        "inLanguage": "en-US",
        "about": [
          {
            "@type": "Thing",
            "name": "Ultra-Processed Foods",
            "sameAs": "https://en.wikipedia.org/wiki/Ultra-processed_food"
          },
          {
            "@type": "Thing",
            "name": "Food Science",
            "sameAs": "https://en.wikipedia.org/wiki/Food_science"
          }
        ],
        "citation": {
          "@type": "CreativeWork",
          "text": `${faq.author.name}. "${faq.question}" ${siteSettings.organization.name}, ${new Date(faq.publishedAt).toLocaleDateString()}. ${pageUrl}`
        }
      },
      // WebPage Entity
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": `${faq.seo?.metaTitle || faq.question} - ${siteSettings.title}`,
        "description": faq.seo?.metaDescription || faq.summaryForAI || `Expert answer about ultra-processed foods: ${faq.question}`,
        "inLanguage": "en-US",
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${siteSettings.url}/#website`
        },
        ...(featuredImageUrl && {
          "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": featuredImageUrl,
            "width": 1200,
            "height": 600
          }
        }),
        "datePublished": faq.publishedAt,
        "dateModified": faq.updatedAt || faq.publishedAt,
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": siteSettings.url
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "FAQs",
              "item": `${siteSettings.url}/faqs`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": faq.question,
              "item": pageUrl
            }
          ]
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".faq-question", ".faq-answer"]
        }
      },
      // Author Person Entity
      {
        "@type": "Person",
        "@id": `${siteSettings.url}/authors/${faq.author.slug.current}#person`,
        "name": faq.author.name,
        "url": `${siteSettings.url}/authors/${faq.author.slug.current}`,
        ...(faq.author.jobTitle && { "jobTitle": faq.author.jobTitle }),
        ...(faq.author.expertise && { "knowsAbout": faq.author.expertise }),
        ...(authorImageUrl && {
          "image": {
            "@type": "ImageObject",
            "url": authorImageUrl,
            "width": 200,
            "height": 200
          }
        }),
        ...(authorSameAs.length > 0 && { "sameAs": authorSameAs })
      },
      // WebSite Entity
      {
        "@type": "WebSite",
        "@id": `${siteSettings.url}/#website`,
        "name": siteSettings.title,
        "description": siteSettings.description,
        "url": siteSettings.url,
        "publisher": {
          "@type": "Organization",
          "@id": `${siteSettings.url}/#organization`
        },
        ...(siteSettings.searchAction?.searchUrl && {
          "potentialAction": {
            "@type": "SearchAction",
            "target": siteSettings.searchAction.searchUrl,
            "query-input": "required name=search_term_string"
          }
        })
      },
      // Organization Entity
      {
        "@type": "Organization",
        "@id": `${siteSettings.url}/#organization`,
        "name": siteSettings.organization.name,
        ...(siteSettings.organization.alternateName && {
          "alternateName": siteSettings.organization.alternateName
        }),
        "url": siteSettings.url,
        "description": siteSettings.description,
        ...(logoUrl && {
          "logo": {
            "@type": "ImageObject",
            "url": logoUrl,
            "width": 200,
            "height": 60
          }
        }),
        ...(siteSettings.organization.foundingDate && {
          "foundingDate": siteSettings.organization.foundingDate
        }),
        ...(siteSettings.organization.areaServed && {
          "areaServed": siteSettings.organization.areaServed
        }),
        ...(siteSettings.organization.knowsAbout && {
          "knowsAbout": siteSettings.organization.knowsAbout
        }),
        ...(organizationSameAs.length > 0 && { "sameAs": organizationSameAs })
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  )
}