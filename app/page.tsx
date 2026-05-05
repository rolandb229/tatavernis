import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PromoPopup } from '@/components/promo-popup'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { PromoBanner } from '@/components/home/promo-banner'
import { BrandsSection } from '@/components/home/brands-section'
import { NewArrivals } from '@/components/home/new-arrivals'
import { WhyChooseUs } from '@/components/home/why-choose-us'
import { NewsletterSection } from '@/components/home/newsletter-section'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProducts />
        <PromoBanner />
        <BrandsSection />
        <NewArrivals />
        <WhyChooseUs />
        <NewsletterSection />
      </main>
      <Footer />
      <PromoPopup />
    </div>
  )
}
