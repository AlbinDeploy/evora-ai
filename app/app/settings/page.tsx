import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/card';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="p-6">
      <Card className="max-w-2xl p-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="mt-6 space-y-3 text-sm text-slate-300">
          <p>Nama: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Status verifikasi: {user.emailVerified ? 'Sudah verified' : 'Belum verified'}</p>
          <p>Gaya Evora: santai, gaul, tetap sopan, tetap bantu manusia.</p>
        </div>
      </Card>
    </div>
  );
}
