import { getTranslations, getLocale } from 'next-intl/server';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/components/landing/Hero';
import PromoVideo from '@/components/landing/PromoVideo';
import PromoVideoES from '@/components/landing/PromoVideoES';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LiveLeaderboard } from '@/components/landing/LiveLeaderboard';
import { Features } from '@/components/landing/Features';
import { Examples } from '@/components/landing/Examples';
import { CTA } from '@/components/landing/CTA';

export default async function Home() {
  const t = await getTranslations('video');
  const locale = await getLocale();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <section className="bg-[#0A0A12] py-16 md:py-20 overflow-hidden">
          <div className="max-w-screen-sm mx-auto px-6 text-center">
            <span className="text-xs tracking-[4px] uppercase text-[#FF6B4A] font-semibold mb-6 block">
              {t('label')}
            </span>
            {locale === 'es' ? <PromoVideoES /> : <PromoVideo />}
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
