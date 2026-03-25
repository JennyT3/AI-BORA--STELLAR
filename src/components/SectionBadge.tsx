import React from 'react';

export function SectionBadge({ text }: { text: string }) {
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full
      bg-fuchsia-brand/10 border border-fuchsia-brand/20 text-xs font-bold tracking-[0.12em]
      uppercase text-fuchsia-brand mb-4`}>
      {text}
    </span>
  );
}
