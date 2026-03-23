import { Card } from '@/components/ui/card';
import { AuthForm } from '@/components/auth-form';

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Reset password</h1>
          <p className="text-sm text-slate-300">Masukin email, nanti Evora kirim link reset.</p>
        </div>
        <AuthForm mode="forgot" />
      </Card>
    </main>
  );
}
