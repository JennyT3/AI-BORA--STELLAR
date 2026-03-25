import { useInView } from 'motion/react';
import { useRef } from 'react';

export function useSectionInView(once = true, margin = "-100px") {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: margin as any });

  return { ref, isInView };
}
