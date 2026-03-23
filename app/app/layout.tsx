import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { AppSidebar } from '@/components/layout/app-sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const items = await db
    .select({ id: chats.id, title: chats.title })
    .from(chats)
    .where(eq(chats.userId, user.id))
    .orderBy(desc(chats.updatedAt))
    .limit(20);

  return (
    <main className="flex min-h-screen">
      <AppSidebar chats={items} />
      <div className="flex-1">{children}</div>
    </main>
  );
}
