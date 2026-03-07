import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Link href="/" className="font-serif text-xl font-bold">
          <span className="text-text">one</span>
          <span className="text-primary">word</span>
        </Link>
        <div className="flex gap-6 text-sm text-text-muted">
          <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-text transition-colors">Terms</Link>
          <a href="mailto:hello@oneword.game" className="hover:text-text transition-colors">Contact</a>
          <a href="#" className="hover:text-text transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
