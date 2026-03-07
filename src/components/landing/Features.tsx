'use client';

import { motion } from 'framer-motion';

const features = [
  {
    emoji: '\u26A1',
    title: '30 seconds a day',
    desc: "No endless scrolling. One word, five words, done. The perfect micro-break that actually makes you feel clever.",
  },
  {
    emoji: '\uD83D\uDD25',
    title: 'Streaks that matter',
    desc: "Play every day. Build your streak. Miss a day, it resets. Simple motivation that keeps you coming back.",
  },
  {
    emoji: '\uD83C\uDFC6',
    title: 'Global leaderboard',
    desc: "Your description competes against thousands. See where you rank. Aim for the crown. Brag to your friends.",
  },
  {
    emoji: '\uD83D\uDCE4',
    title: 'Built to share',
    desc: "Beautiful result cards designed for Instagram, WhatsApp, and Twitter. Your creativity deserves an audience.",
  },
  {
    emoji: '\uD83E\uDDE0',
    title: 'No right answer',
    desc: "Unlike every other word game, there's no correct solution. Funny beats formal. Clever beats correct. You decide.",
  },
  {
    emoji: '\uD83C\uDF0D',
    title: 'Same word, whole world',
    desc: "Everyone plays the same word every day. Compare your mind against millions of others. See how the world thinks.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Why you&apos;ll love it
        </span>
        <h2 className="mt-3 font-serif text-4xl font-bold text-text md:text-5xl">
          Not just a word game.
        </h2>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-white p-7"
          >
            <span className="text-3xl">{feat.emoji}</span>
            <h3 className="mt-4 font-serif text-lg font-bold text-text">{feat.title}</h3>
            <p className="mt-2 leading-relaxed text-text-muted">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
