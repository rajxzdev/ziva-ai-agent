/** Renderer Markdown minimal & aman (escape dulu, baru format). */
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderMarkdown(src: string): string {
  if (!src) return '';
  const blocks: string[] = [];
  let text = esc(src).replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) => {
    blocks.push(`<pre><code data-lang="${lang}">${code.replace(/\n$/, '')}</code></pre>`);
    return `\u0000BLOCK${blocks.length - 1}\u0000`;
  });

  const lines = text.split('\n');
  const out: string[] = [];
  let inUl = false, inOl = false, inTable = false;

  const closeLists = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };
  const closeTable = () => { if (inTable) { out.push('</tbody></table>'); inTable = false; } };

  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/(^|[\s(])_([^_\n]+)_/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (/^\u0000BLOCK\d+\u0000$/.test(line.trim())) { closeLists(); closeTable(); out.push(line.trim()); continue; }
    if (!line.trim()) { closeLists(); closeTable(); continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { closeLists(); closeTable(); out.push(`<h${Math.min(3, h[1].length)}>${inline(h[2])}</h${Math.min(3, h[1].length)}>`); continue; }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) { closeLists(); closeTable(); out.push('<hr/>'); continue; }

    if (/^\|(.+)\|$/.test(line.trim())) {
      const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim());
      const next = (lines[i + 1] ?? '').trim();
      if (!inTable && /^\|[\s:|-]+\|$/.test(next)) {
        closeLists();
        out.push('<table><thead><tr>' + cells.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>');
        inTable = true; i++; continue;
      }
      if (inTable) { out.push('<tr>' + cells.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>'); continue; }
    } else closeTable();

    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    if (ul) { if (inOl) { out.push('</ol>'); inOl = false; } if (!inUl) { out.push('<ul>'); inUl = true; } out.push(`<li>${inline(ul[1])}</li>`); continue; }

    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ol) { if (inUl) { out.push('</ul>'); inUl = false; } if (!inOl) { out.push('<ol>'); inOl = true; } out.push(`<li>${inline(ol[1])}</li>`); continue; }

    closeLists();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeLists(); closeTable();

  return out.join('\n').replace(/\u0000BLOCK(\d+)\u0000/g, (_m, n) => blocks[Number(n)] ?? '');
}
