'use client';

import { renderMarkdown } from '@/lib/md';
import { cx } from '@/lib/utils';

export function Markdown({ text, className }: { text: string; className?: string }) {
  return <div className={cx('z-md', className)} dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />;
}
