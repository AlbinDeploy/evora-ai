import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-400',
        className,
      )}
      {...props}
    />
  );
}
