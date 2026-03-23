import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Card } from '@/components/ui/card';

const features = [
  'Chat AI premium feel dengan streaming dan history',
  'Upload gambar, PDF, txt, md, dan json',
  'Coding assistant dengan code box rapi dan copy code',
  'Generate file txt, md, json, dan pdf',
  'Auth aman dengan verifikasi email real',
  'Neon PostgreSQL + deploy siap ke Vercel',
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:py-28">
        <div className="space-y-8">
          <span className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-200">
            Asisten AI buat bantu manusia, bukan bikin ribet
          </span>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Evora AI, clean dan premium buat chat, coding, analisis file, dan kerja harian.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Dibangun dengan UX simpel, stack gratisan yang realistis, dan fondasi keamanan yang proper.
              Cocok buat user yang mau AI rasa premium tanpa overengineered.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/register" className="rounded-full bg-white px-6 py-3 font-medium text-slate-950">Mulai gratis</Link>
            <Link href="/login" className="rounded-full border border-white/10 px-6 py-3 text-slate-200">Login</Link>
          </div>
        </div>
        <Card className="p-6 shadow-2xl shadow-indigo-950/40">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <div>
                <p className="text-sm text-slate-400">AI chat</p>
                <p className="mt-1 font-medium">Streaming, history, upload, dan coding</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">Online</span>
            </div>
            <div className="grid gap-3">
              {features.map((feature) => (
                <div key={feature} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
