import type { Metadata } from 'next';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'OneWord — One word. Five words to describe it.',
  description:
    'A daily word game where everyone gets the same word and describes it in exactly 5 words. The community votes. The wittiest wins. Play free on iOS and web.',
  keywords: [
    'word game',
    'daily game',
    'wordle alternative',
    'creative writing game',
    'vocabulary game',
    'five words',
    'oneword game',
  ],
  openGraph: {
    title: 'OneWord — Can you describe it in 5 words?',
    description:
      'A daily word game for creative minds. One word. Five words to describe it. The world votes.',
    type: 'website',
    locale: 'en_US',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneWord — Can you describe it in 5 words?',
    description: 'A daily word game for creative minds.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
