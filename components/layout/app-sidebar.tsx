import Link from 'next/link';
import { Plus, Settings } from 'lucide-react';

export function AppSidebar({ chats }: { chats: { id: string; title: string }[] }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/40 p-4 lg:block">
      <Link href="/app/chat/new" className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950">
        <Plus className="h-4 w-4" /> Chat baru
      </Link>
      <div className="space-y-2">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/app/chat/${chat.id}`} className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 hover:bg-white/10">
            {chat.title}
          </Link>
        ))}
      </div>
      <Link href="/app/settings" className="mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5">
        <Settings className="h-4 w-4" /> Settings
      </Link>
    </aside>
  );
}
