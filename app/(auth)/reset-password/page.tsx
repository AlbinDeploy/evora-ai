import { Card } from '@/components/ui/card';
import { AuthForm } from '@/components/auth-form';

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Atur password baru</h1>
          <p className="text-sm text-slate-300">Pakai password yang aman ya, jangan yang gampang ditebak.</p>
        </div>
        <AuthForm mode="reset" />
      </Card>
    </main>
  );
}
