import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/components/landing/Hero';
import PromoVideo from '@/components/landing/PromoVideo';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LiveLeaderboard } from '@/components/landing/LiveLeaderboard';
import { Features } from '@/components/landing/Features';
import { Examples } from '@/components/landing/Examples';
import { CTA } from '@/components/landing/CTA';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <section className="bg-[#0A0A12] py-16 md:py-20">
          <div className="max-w-screen-sm mx-auto px-6 text-center">
            <span className="text-xs tracking-[4px] uppercase text-[#FF6B4A] font-semibold mb-6 block">
              See it in action
            </span>
            <PromoVideo />
          </div>
        </section>
        <HowItWorks />
        <LiveLeaderboard />
        <Features />
        <Examples />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
