import React from 'react';

// Minimal, safe renderer for AI replies: paragraphs, bullets, numbered lists,
// **bold**, `code`, and #-headings. Builds React elements - never raw HTML.
const renderInline = (text, keyPrefix) => {
  const out = [];
  const re = /(\*\*[^*\n]+\*\*|`[^`\n]+`)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
      out.push(<strong key={`${keyPrefix}-${i++}`} className="font-semibold text-ink">{tok.slice(2, -2)}</strong>);
    } else {
      out.push(
        <code key={`${keyPrefix}-${i++}`} className="num rounded bg-elevated px-1 py-0.5 text-[0.9em]">
          {tok.slice(1, -1)}
        </code>
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

const Markdown = ({ text = '', className = '' }) => {
  const lines = String(text).replace(/\r/g, '').split('\n');
  const blocks = [];
  let list = null;

  const flush = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  lines.forEach((raw) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      return;
    }
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push({ type: 'h', text: heading[1] });
    } else if (bullet) {
      if (!list || list.type !== 'ul') {
        flush();
        list = { type: 'ul', items: [] };
      }
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (!list || list.type !== 'ol') {
        flush();
        list = { type: 'ol', items: [] };
      }
      list.items.push(numbered[2]);
    } else {
      flush();
      blocks.push({ type: 'p', text: line.trim() });
    }
  });
  flush();

  return (
    <div className={`space-y-2.5 text-body text-ink ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === 'h') {
          return (
            <p key={i} className="pt-1 font-semibold text-ink">
              {renderInline(b.text, `h${i}`)}
            </p>
          );
        }
        if (b.type === 'ul') {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 marker:text-ink-3">
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it, `u${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === 'ol') {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5 marker:text-ink-3">
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it, `o${i}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{renderInline(b.text, `p${i}`)}</p>;
      })}
    </div>
  );
};

export default Markdown;
