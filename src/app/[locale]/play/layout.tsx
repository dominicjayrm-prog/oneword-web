import type { Metadata } from 'next';
import PlayLayoutClient from './PlayLayout';

export const metadata: Metadata = {
  title: 'Play — OneWord',
  robots: { index: false, follow: false },
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <PlayLayoutClient>{children}</PlayLayoutClient>;
}
