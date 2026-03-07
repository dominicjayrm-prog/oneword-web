import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — OneWord',
  description:
    'How OneWord handles your data. What we collect, what we don\'t, and your rights.',
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

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[720px] px-6 pb-20 pt-28">
        <p className="text-sm text-text-muted">Last updated: March 7, 2026</p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-text md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-lg" style={{ color: '#4A4A5A' }}>
          Your privacy matters. Here&apos;s exactly what we collect, why, and what we don&apos;t.
        </p>

        <div className="mt-12 space-y-10" style={{ color: '#4A4A5A', lineHeight: 1.7 }}>
          <Section title="1. What We Collect">
            <p>
              When you create a OneWord account, we collect your email address, a username you
              choose, and an optional profile avatar. This is the minimum we need to create your
              account and let you play.
            </p>
            <p>
              When you use the app, we collect the descriptions you submit for daily words, your
              votes on other players&apos; descriptions, your gameplay statistics (streak count,
              total plays, ranking history), and your language preference.
            </p>
            <p>
              To send you notifications, we store your device&apos;s push notification token. This is
              a random identifier — it is not your phone number or any personal identifier.
            </p>
            <p>If you add friends, we store the connection between your account and theirs.</p>
          </Section>

          <Section title="2. What We Don't Collect">
            <p>
              We do not collect your real name, phone number, physical address, precise location,
              contacts list, browsing history, financial information, or any biometric data. We do
              not read your messages or access your camera, microphone, or files.
            </p>
          </Section>

          <Section title="3. How We Use Your Data">
            <p>
              We use your data to: operate the game (showing daily words, recording descriptions,
              calculating rankings), display leaderboards, maintain your streak, connect you with
              friends, send push notifications you&apos;ve opted into, and improve the app
              experience.
            </p>
            <p>
              We do not sell your personal data to anyone. We do not use your data for advertising
              targeting. We do not share your data with third parties for their marketing purposes.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>OneWord uses the following third-party services to operate:</p>
            <p>
              <strong>Supabase:</strong> Hosts our database and authentication system. Your account
              data and game data are stored on Supabase&apos;s servers. Supabase&apos;s privacy
              policy is available at{' '}
              <a
                href="https://supabase.com/privacy"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                supabase.com/privacy
              </a>
              .
            </p>
            <p>
              <strong>Expo:</strong> Handles push notification delivery. Your push notification token
              is processed through Expo&apos;s notification service. Expo&apos;s privacy policy is
              available at{' '}
              <a
                href="https://expo.dev/privacy"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                expo.dev/privacy
              </a>
              .
            </p>
            <p>
              <strong>Vercel:</strong> Hosts our website. Vercel&apos;s privacy policy is available
              at{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                vercel.com/legal/privacy-policy
              </a>
              .
            </p>
            <p>
              In the future, we may integrate advertising services (such as Google AdMob) to display
              ads to free users. If we do, we will update this privacy policy to reflect the
              additional data processing involved.
            </p>
          </Section>

          <Section title="5. Data Storage and Security">
            <p>
              Your data is stored securely on Supabase&apos;s cloud infrastructure with encryption
              at rest and in transit. Access to the database is protected by Row Level Security
              policies ensuring users can only access their own data.
            </p>
            <p>
              We retain your data for as long as your account is active. If you delete your account,
              all your personal data including your descriptions, votes, statistics, and friend
              connections are permanently deleted from our systems.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p>
              You can view all data associated with your account within the app (profile, statistics,
              descriptions).
            </p>
            <p>
              You can delete your account at any time from the app&apos;s profile settings. This
              permanently removes all your data.
            </p>
            <p>
              You can disable push notifications at any time through the app settings or your device
              settings.
            </p>
            <p>You can change your username, avatar, and language preference at any time.</p>
            <p>
              If you are located in the European Economic Area (EEA), you have additional rights
              under GDPR including the right to access, rectify, port, and erase your personal data.
              To exercise these rights, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>
              OneWord is not directed at children under the age of 13. We do not knowingly collect
              personal information from children under 13. If we discover that a child under 13 has
              created an account, we will promptly delete their account and all associated data. If
              you believe a child under 13 is using OneWord, please contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="8. International Data Transfers">
            <p>
              Our services are hosted on infrastructure that may be located outside your country of
              residence. By using OneWord, you consent to the transfer of your information to
              countries that may have different data protection laws than your own.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this privacy policy from time to time. If we make significant changes, we
              will notify users through the app or by email. Continued use of OneWord after changes
              constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>
              If you have questions about this privacy policy or your data, contact us at:
            </p>
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
