'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const words = ['Where', 'fish', 'pay', 'no', 'rent'];

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* Decorative gradient circles */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue/[0.04] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center"
      >
        {/* Pill badge */}
        <span className="mb-8 rounded-full bg-primary-light px-5 py-2 text-sm font-medium text-primary">
          A new daily game for creative minds
        </span>

        {/* Headline */}
        <h1 className="font-serif font-black leading-[1.05] text-text" style={{ fontSize: 'clamp(48px, 8vw, 86px)' }}>
          One word.
          <br />
          <span className="text-primary">Five words</span> to describe it.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-[480px] text-[19px] leading-relaxed text-text-muted">
          Every day, the whole world gets the same word. You describe it in exactly 5 words. The
          community votes. The wittiest rise to the top.
        </p>

        {/* Demo card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-xl shadow-black/5"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            today&apos;s word
          </span>
          <h2 className="mt-2 font-serif text-5xl font-black tracking-tight text-text md:text-6xl">
            OCEAN
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {words.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.6 }}
                className="rounded-full border-2 border-primary bg-primary-light px-4 py-1.5 text-base font-medium text-primary"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.8 }}
            className="mt-4 font-mono text-sm text-primary"
          >
            5/5 words &#10003;
          </motion.p>
        </motion.div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button variant="dark" size="lg" as="a" href="#">
            &#127822; App Store
          </Button>
          <Button variant="outline" size="lg" as="a" href="/play">
            &#127760; Play on Web
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
