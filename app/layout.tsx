import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StudyPilot — AI-Powered Study Planner for Students',
  description: 'StudyPilot uses AI to create personalized study plans, track your progress, and help you ace every exam. Free to start. No credit card required.',
  keywords: [
    'AI study planner', 'study planner app', 'exam preparation',
    'student productivity', 'personalized study plan', 'AI timetable generator',
    'study tracker', 'exam readiness score', 'focus timer', 'Pomodoro study',
    'study schedule app', 'academic planner', 'study analytics', 'Nigeria student app',
  ],
  authors: [{ name: 'StudyPilot', url: 'https://studypilot.app' }],
  creator: 'StudyPilot',
  publisher: 'StudyPilot',
  metadataBase: new URL('https://studypilot.app'),
  alternates: { canonical: '/' },

  openGraph: {
    type: 'website',
    url: 'https://studypilot.app',
    title: 'StudyPilot — AI-Powered Study Planner for Students',
    description: 'Plan smarter, study better. AI creates your personalized timetable, tracks progress, and helps you ace every exam.',
    siteName: 'StudyPilot',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'StudyPilot — AI Study Planner' }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'StudyPilot — AI-Powered Study Planner',
    description: 'Plan smarter, study better. AI-powered study planning for students.',
    creator: '@studypilot',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/site.webmanifest',
  category: 'education',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Schema.org Structured Data — Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'StudyPilot',
              url: 'https://studypilot.app',
              description: 'AI-powered study planner that creates personalized timetables, tracks progress, and helps students ace every exam.',
              applicationCategory: 'EducationApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                description: 'Free plan available. Pro plan from $8/month.',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '2400',
              },
              author: {
                '@type': 'Organization',
                name: 'StudyPilot',
                url: 'https://studypilot.app',
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}