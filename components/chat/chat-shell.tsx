'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Paperclip, Square, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageBubble } from './message-bubble';

export type InitialMessage = { id: string; role: 'user' | 'assistant'; content: string };

export function ChatShell({ chatId, initialMessages }: { chatId: string; initialMessages: InitialMessage[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<{ id: string; originalName: string; mimeType: string }[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
  const canSend = useMemo(() => text.trim().length > 0 || uploads.length > 0, [text, uploads]);

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const form = new FormData();
    Array.from(fileList).forEach((file) => form.append('files', file));
    form.append('chatId', chatId === 'new' ? '' : chatId);

    const response = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload gagal');
    setUploads((current) => [...current, ...data.uploads]);
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!canSend || loading) return;
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const tempUser = { id: crypto.randomUUID(), role: 'user' as const, content: text };
    const tempAssistant = { id: crypto.randomUUID(), role: 'assistant' as const, content: '' };
    setMessages((current) => [...current, tempUser, tempAssistant]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: text, uploadIds: uploads.map((item) => item.id) }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Chat gagal');
      }

      const nextChatId = response.headers.get('x-chat-id');
      if (nextChatId && chatId === 'new') router.replace(`/app/chat/${nextChatId}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let combined = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        combined += decoder.decode(value, { stream: true });
        setMessages((current) => current.map((item) => item.id === tempAssistant.id ? { ...item, content: combined } : item));
      }

      setText('');
      setUploads([]);
      router.refresh();
    } catch (error) {
      setMessages((current) => current.filter((item) => item.id !== tempAssistant.id));
      toast.error(error instanceof Error ? error.message : 'Chat error');
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  async function createFile(type: 'txt' | 'md' | 'json' | 'pdf') {
    const assistant = [...messages].reverse().find((item) => item.role === 'assistant' && item.content.trim());
    if (!assistant) return toast.error('Belum ada jawaban AI buat dijadiin file.');

    const response = await fetch('/api/files/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content: assistant.content }),
    });
    if (!response.ok) return toast.error('Gagal bikin file.');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evora-output.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4 p-4">
      <Card className="hidden w-72 shrink-0 p-4 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Tools</h2>
          <WandSparkles className="h-4 w-4 text-indigo-300" />
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <p>Upload file, ngobrol santai, lalu export jawaban jadi file.</p>
          <div className="grid gap-2 pt-2">
            <Button type="button" className="bg-white/10 text-white" onClick={() => createFile('txt')}>Export TXT</Button>
            <Button type="button" className="bg-white/10 text-white" onClick={() => createFile('md')}>Export MD</Button>
            <Button type="button" className="bg-white/10 text-white" onClick={() => createFile('json')}>Export JSON</Button>
            <Button type="button" className="bg-white/10 text-white" onClick={() => createFile('pdf')}>Export PDF</Button>
          </div>
        </div>
      </Card>
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-6 text-sm text-slate-300">
              Halo, gue Evora. Drop pertanyaan, file, atau task coding lo di sini.
            </div>
          ) : messages.map((message) => <MessageBubble key={message.id} role={message.role} content={message.content} />)}
          {loading && <div className="text-sm text-slate-400">Evora lagi mikir bentar...</div>}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="border-t border-white/10 p-4">
          {uploads.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-300">
              {uploads.map((item) => <span key={item.id} className="rounded-full border border-white/10 px-3 py-1">{item.originalName}</span>)}
            </div>
          )}
          <div className="flex gap-3">
            <label className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Paperclip className="h-4 w-4" />
              <input type="file" multiple className="hidden" onChange={(e) => uploadFiles(e.target.files).catch((err) => toast.error(err.message))} />
            </label>
            <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tanya apa aja, kasih task coding, atau minta analisis file..." />
            <div className="flex flex-col gap-2">
              <Button disabled={!canSend || loading} className="h-12 w-28">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Kirim'}</Button>
              <Button
                type="button"
                disabled={!loading}
                className="h-12 w-28 bg-white/10 text-white"
                onClick={() => abortRef.current?.abort()}
              >
                <Square className="mr-2 h-4 w-4" /> Stop
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
