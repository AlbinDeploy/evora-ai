'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AuthForm({ mode }: { mode: 'login' | 'register' | 'forgot' | 'reset' }) {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const endpoint =
        mode === 'login'
          ? '/api/auth/login'
          : mode === 'register'
            ? '/api/auth/register'
            : mode === 'forgot'
              ? '/api/auth/forgot-password'
              : '/api/auth/reset-password';

      if (mode === 'reset') {
        form.set('token', params.get('token') || '');
      }

      const response = await fetch(endpoint, { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request gagal');

      toast.success(data.message || 'Berhasil');
      if (mode === 'login') router.push('/app/chat/new');
      if (mode === 'register') router.push('/login');
      if (mode === 'reset') router.push('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ada error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === 'register' && <Input name="name" placeholder="Nama kamu" required minLength={2} maxLength={40} />}
      {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
        <Input name="email" type="email" placeholder="Email" required />
      )}
      {(mode === 'login' || mode === 'register' || mode === 'reset') && (
        <Input name="password" type="password" placeholder="Password" required minLength={8} />
      )}
      <Button className="w-full" disabled={loading}>
        {loading ? 'Lagi diproses...' : mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : mode === 'forgot' ? 'Kirim link reset' : 'Reset password'}
      </Button>
    </form>
  );
}
