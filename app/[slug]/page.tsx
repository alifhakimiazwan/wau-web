import { notFound } from "next/navigation"
import { getPublicStore } from "@/lib/storefront/actions"
import { LandingPageLayout } from "@/components/storefront/landing-page-layout"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const storeData = await getPublicStore(slug)

  if (!storeData) {
    return {
      title: "Store Not Found",
    }
  }

  const { store } = storeData
  const description =
    store.bio || `Check out ${store.name}'s store on Wau`

  return {
    title: store.name,
    description,
    openGraph: {
      title: store.name,
      description,
      images: store.profile_pic_url
        ? [
            {
              url: store.profile_pic_url,
              width: 400,
              height: 400,
              alt: store.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary",
      title: store.name,
      description,
      images: store.profile_pic_url ? [store.profile_pic_url] : [],
    },
  }
}

// Server Component - fetches data and renders layout
export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params
  const storeData = await getPublicStore(slug)

  // Show 404 if store doesn't exist
  if (!storeData) {
    notFound()
  }

  const { store, products, socialLinks, customization } = storeData

  return (
    <AnalyticsProvider storeId={store.id}>
      <LandingPageLayout
        store={store}
        products={products}
        socialLinks={socialLinks}
        customization={customization}
      />
    </AnalyticsProvider>
  )
}
