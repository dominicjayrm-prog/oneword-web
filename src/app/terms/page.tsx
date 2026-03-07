import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Terms of Use — OneWord',
  description: 'Terms of use for the OneWord daily word game.',
};

const CONTACT_EMAIL = 'hello@oneword.game';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-l-2 border-primary pl-6">
      <h2 className="font-serif text-xl font-bold text-text">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[720px] px-6 pb-20 pt-28">
        <p className="text-sm text-text-muted">Last updated: March 7, 2026</p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-text md:text-5xl">
          Terms of Use
        </h1>
        <p className="mt-3 text-lg" style={{ color: '#4A4A5A' }}>
          The rules of the game. Simple and fair.
        </p>

        <div className="mt-12 space-y-10" style={{ color: '#4A4A5A', lineHeight: 1.7 }}>
          <Section title="1. Acceptance of Terms">
            <p>
              By creating an account or using OneWord, you agree to these terms. If you don&apos;t
              agree, please don&apos;t use the app. It&apos;s that simple.
            </p>
          </Section>

          <Section title="2. The Game">
            <p>
              OneWord is a daily word game. Each day, a word is presented and you describe it in
              exactly five words. Your description is submitted to a community voting system where
              other players vote on descriptions in head-to-head matchups. Rankings are determined by
              an algorithmic rating system based on these votes.
            </p>
          </Section>

          <Section title="3. Your Account">
            <p>
              You must provide a valid email address and choose a username to create an account. You
              are responsible for maintaining the security of your account. One account per person.
              Creating multiple accounts to manipulate voting or rankings is prohibited.
            </p>
            <p>
              Your username must not impersonate another person, contain offensive or hateful
              language, or infringe on any trademark.
            </p>
          </Section>

          <Section title="4. Your Content">
            <p>
              When you submit a description, you grant OneWord a worldwide, non-exclusive,
              royalty-free licence to display, distribute, and use that description within the game
              and for promotional purposes (such as displaying top descriptions on the website or in
              marketing materials).
            </p>
            <p>
              You retain ownership of your descriptions. You can delete your account and all
              associated content at any time.
            </p>
            <p>
              You are responsible for the content you submit. Descriptions must not contain hate
              speech or discrimination based on race, ethnicity, gender, sexual orientation,
              religion, or disability. Descriptions must not contain threats of violence, harassment,
              or targeted abuse toward any individual or group. Descriptions must not contain
              sexually explicit content. Descriptions must not contain personal information about
              other people (names, addresses, phone numbers). Descriptions must not be used for spam,
              advertising, or commercial promotion. Descriptions must not infringe on intellectual
              property rights.
            </p>
            <p>
              We reserve the right to remove any description that violates these guidelines and to
              suspend or terminate accounts that repeatedly violate them.
            </p>
          </Section>

          <Section title="5. Voting and Rankings">
            <p>
              Rankings are determined algorithmically based on community votes. We do not guarantee
              any specific ranking outcome. We reserve the right to adjust the ranking algorithm at
              any time to improve fairness and the overall game experience.
            </p>
            <p>
              Attempting to manipulate rankings through fake accounts, coordinated voting, bots, or
              any other means is strictly prohibited and will result in immediate account termination.
            </p>
          </Section>

          <Section title="6. Friends and Social Features">
            <p>
              You can send and receive friend requests from other players. You can remove friends at
              any time. We do not share your friends list publicly — only mutual friends can see the
              connection.
            </p>
          </Section>

          <Section title="7. Availability">
            <p>
              OneWord is provided on an &ldquo;as is&rdquo; basis. We aim to keep the service
              running 24/7 but do not guarantee uninterrupted availability. The daily word resets at
              midnight UTC. We reserve the right to perform maintenance, updates, or modifications at
              any time.
            </p>
          </Section>

          <Section title="8. Free and Paid Features">
            <p>
              OneWord offers both free and paid features. Free features may include advertising. Paid
              features (subscriptions or one-time purchases) are processed through the Apple App
              Store, Google Play Store, or our website. Refund policies are governed by the
              respective platform&apos;s terms.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              We may suspend or terminate your account if you violate these terms, attempt to
              manipulate the game, harass other users, or use the service in any way that is harmful
              to other users or to OneWord. You may delete your account at any time through the app
              settings.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              OneWord is a game and is provided for entertainment purposes. To the maximum extent
              permitted by law, we are not liable for any indirect, incidental, special, or
              consequential damages arising from your use of the service.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These terms are governed by the laws of the United Kingdom. Any disputes will be
              resolved in the courts of England and Wales.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We may update these terms from time to time. Significant changes will be communicated
              through the app or by email. Continued use constitutes acceptance.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>Questions about these terms? Contact us at:</p>
            <p>
              Email:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Section>
        </div>

        <div className="mt-16">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            &larr; Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
