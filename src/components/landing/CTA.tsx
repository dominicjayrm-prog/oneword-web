'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-2xl px-6 text-center"
      >
        <h2 className="font-serif text-4xl font-bold text-text md:text-6xl">
          Today&apos;s word is waiting.
        </h2>
        <p className="mt-6 text-lg text-text-muted">
          Join thousands of players describing the world in exactly five words.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" as="a" href="#">
            Download for iOS
          </Button>
          <Button variant="outline" size="lg" as="a" href="/play">
            Play in browser
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
