import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Evora AI',
  description: 'Asisten AI clean, modern, dan premium feel buat bantu kerja harian.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
