import { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400',
        className,
      )}
      {...props}
    />
  );
}
