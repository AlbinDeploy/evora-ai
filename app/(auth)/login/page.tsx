import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { AuthForm } from '@/components/auth-form';

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Login ke Evora AI</h1>
          <p className="text-sm text-slate-300">
            Masuk dan lanjut ngobrol, ngoding, atau analisis file.
          </p>
        </div>

        <AuthForm
          mode="login"
          redirect={params.redirect}
          callbackUrl={params.callbackUrl}
          error={params.error}
        />

        <div className="mt-6 flex justify-between text-sm text-slate-300">
          <Link href="/forgot-password">Lupa password</Link>
          <Link href="/register">Belum punya akun?</Link>
        </div>
      </Card>
    </main>
  );
}
