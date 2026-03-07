'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'See the word',
    desc: "Every day at midnight, a new word drops. The same word for everyone on earth. Could be simple. Could be abstract. Could be spicy.",
    color: 'bg-primary/10 text-primary',
  },
  {
    num: '02',
    title: 'Describe it in 5',
    desc: "Exactly five words. Not four. Not six. Be clever. Be funny. Be poetic. The constraint is what makes it a game — anyone can be witty in a paragraph.",
    color: 'bg-blue/10 text-blue',
  },
  {
    num: '03',
    title: 'The world votes',
    desc: "Your description goes head-to-head against others. Tap to vote. The best descriptions rise. See where you ranked. Share your result. Come back tomorrow.",
    color: 'bg-gold/10 text-gold',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          How it works
        </span>
        <h2 className="mt-3 font-serif text-4xl font-bold text-text md:text-5xl">
          Three steps. Thirty seconds.
        </h2>
      </div>

      <div className="mt-16 flex flex-col gap-10">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="flex gap-6"
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-mono text-lg font-bold ${step.color}`}
            >
              {step.num}
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-text">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-text-muted">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
