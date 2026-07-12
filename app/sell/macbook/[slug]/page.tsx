import type { Metadata } from 'next'
import { ModelLanding, landingStaticParams, landingMetadata } from '@/components/ModelLanding'

export const dynamicParams = true
export const revalidate = 3600

export function generateStaticParams() {
  return landingStaticParams('macbook')
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return landingMetadata('macbook', slug)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ModelLanding category="macbook" slug={slug} />
}
