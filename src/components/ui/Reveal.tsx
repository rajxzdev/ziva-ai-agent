'use client';

import * as React from 'react';
import { cx } from '@/lib/utils';

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'header';
  once?: boolean;
}

/** Animasi muncul saat elemen masuk viewport (scroll animation). */
export function Reveal({ delay = 0, as = 'div', once = true, className, children, ...rest }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [seen, setSeen] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setSeen(true); if (once) io.disconnect(); }
        else if (!once) setSeen(false);
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={cx('z-reveal', seen && 'is-in', className)}
      style={{ animationDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Progress bar tipis mengikuti posisi scroll halaman. */
export function ScrollProgress() {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        className="h-full rounded-r-full transition-[width] duration-150 ease-out"
        style={{ width: `${p}%`, background: 'linear-gradient(90deg, var(--brand-1), var(--brand-2), var(--brand-3))' }}
      />
    </div>
  );
}
