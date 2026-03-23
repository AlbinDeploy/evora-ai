import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { AuthForm } from '@/components/auth-form';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Bikin akun Evora AI</h1>
          <p className="text-sm text-slate-300">Verifikasi email real, auth aman, dan langsung siap dipakai.</p>
        </div>
        <AuthForm mode="register" />
        <div className="mt-6 text-center text-sm text-slate-300">
          <Link href="/login">Sudah punya akun? Login</Link>
        </div>
      </Card>
    </main>
  );
}
