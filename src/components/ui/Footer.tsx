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
          <a href="#" className="hover:text-text transition-colors">Privacy</a>
          <a href="#" className="hover:text-text transition-colors">Terms</a>
          <a href="#" className="hover:text-text transition-colors">Contact</a>
          <a href="#" className="hover:text-text transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
