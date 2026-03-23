import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">Evora AI</Link>
        <nav className="flex items-center gap-3 text-sm text-slate-300">
          <Link href="/login" className="rounded-full px-4 py-2 hover:bg-white/5">Login</Link>
          <Link href="/register" className="rounded-full bg-white px-4 py-2 font-medium text-slate-900">Register</Link>
        </nav>
      </div>
    </header>
  );
}
