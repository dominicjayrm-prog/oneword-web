import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/components/landing/Hero';
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
