'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

type Segment = { type: 'text'; value: string } | { type: 'code'; lang: string; value: string };

function parseSegments(content: string): Segment[] {
  const regex = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', lang: match[1] || 'code', value: match[2] || '' });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return segments;
}

export function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  const segments = parseSegments(content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl rounded-3xl px-4 py-3 text-sm leading-7 ${isUser ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-100'}`}>
        <div className="mb-2 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.2em] opacity-70">
          <span>{isUser ? 'You' : 'Evora'}</span>
          {!isUser && (
            <button
              className="inline-flex items-center gap-1"
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast.success('Jawaban dicopy.');
              }}
              type="button"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          )}
        </div>
        <div className="space-y-3">
          {segments.map((segment, index) =>
            segment.type === 'text' ? (
              <pre key={index} className="whitespace-pre-wrap break-words font-sans">{segment.value}</pre>
            ) : (
              <div key={index} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-slate-400">
                  <span>{segment.lang}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(segment.value);
                      toast.success('Code dicopy.');
                    }}
                  >
                    Copy code
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 text-xs leading-6 text-slate-100"><code>{segment.value}</code></pre>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
