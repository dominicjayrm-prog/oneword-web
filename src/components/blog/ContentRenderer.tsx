import Image from 'next/image';
import { FaqAccordionItem } from './FaqAccordion';
import type { ContentBlock } from '@/lib/blog/types';

function parseInlineFormatting(text: string): React.ReactNode {
  // Parse bold (**text**), italic (*text*), and links [text](url)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Check for link [text](url)
    const linkMatch = remaining.match(/^([\s\S]*?)\[([^\]]+)\]\(([^)]+)\)([\s\S]*)/);
    // Check for bold **text**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*([\s\S]*)/);
    // Check for italic *text*
    const italicMatch = remaining.match(/^([\s\S]*?)\*([\s\S]+?)\*([\s\S]*)/);

    // Find the earliest match
    const matches = [
      linkMatch ? { type: 'link' as const, index: linkMatch[1].length, match: linkMatch } : null,
      boldMatch ? { type: 'bold' as const, index: boldMatch[1].length, match: boldMatch } : null,
      italicMatch ? { type: 'italic' as const, index: italicMatch[1].length, match: italicMatch } : null,
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;

    if (first.type === 'link' && first.match) {
      const m = first.match;
      if (m[1]) parts.push(m[1]);
      parts.push(
        <a key={key++} href={m[3]} className="text-primary underline" target="_blank" rel="noopener noreferrer">
          {m[2]}
        </a>
      );
      remaining = m[4];
    } else if (first.type === 'bold' && first.match) {
      const m = first.match;
      if (m[1]) parts.push(m[1]);
      parts.push(<strong key={key++}>{m[2]}</strong>);
      remaining = m[3];
    } else if (first.type === 'italic' && first.match) {
      const m = first.match;
      if (m[1]) parts.push(m[1]);
      parts.push(<em key={key++}>{m[2]}</em>);
      remaining = m[3];
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function RenderBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      if (block.level === 2) {
        return <h2 className="mt-10 mb-4 font-serif text-2xl font-bold text-text">{block.text}</h2>;
      }
      return <h3 className="mt-8 mb-3 font-serif text-xl font-bold text-text">{block.text}</h3>;

    case 'paragraph':
      return <p className="mb-4 leading-relaxed">{parseInlineFormatting(block.text)}</p>;

    case 'image':
      return (
        <figure className="my-8">
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src={block.url}
              alt={block.alt}
              fill
              className="object-cover"
              sizes="(max-width: 720px) 100vw, 720px"
              loading="lazy"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-text-muted">{block.caption}</figcaption>
          )}
        </figure>
      );

    case 'list': {
      const Tag = block.style === 'numbered' ? 'ol' : 'ul';
      return (
        <Tag className={`mb-4 ml-6 space-y-1 ${block.style === 'numbered' ? 'list-decimal' : 'list-disc'}`}>
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">{parseInlineFormatting(item)}</li>
          ))}
        </Tag>
      );
    }

    case 'quote':
      return (
        <blockquote className="my-6 border-l-4 border-primary pl-6 italic">
          <p className="leading-relaxed">{parseInlineFormatting(block.text)}</p>
          {block.attribution && (
            <cite className="mt-2 block text-sm text-text-muted not-italic">— {block.attribution}</cite>
          )}
        </blockquote>
      );

    case 'divider':
      return <hr className="my-8 border-t border-primary/30" />;

    case 'callout':
      return (
        <div className="my-6 rounded-xl border border-primary/20 bg-primary-light px-6 py-4">
          <p className="leading-relaxed">
            {block.emoji && <span className="mr-2">{block.emoji}</span>}
            {parseInlineFormatting(block.text)}
          </p>
        </div>
      );

    case 'code':
      return (
        <pre className="my-6 overflow-x-auto rounded-xl bg-bg-dark p-6 text-sm text-text-light">
          <code>{block.code}</code>
        </pre>
      );

    case 'faq':
      return (
        <div className="my-6 rounded-xl border border-primary/20 bg-white p-6">
          {block.items.map((item, i) => (
            <FaqAccordionItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      );

    default:
      return null;
  }
}

export function ContentRenderer({ content }: { content: ContentBlock[] }) {
  return (
    <div style={{ color: '#4A4A5A', lineHeight: 1.7 }}>
      {content.map((block, i) => (
        <RenderBlock key={i} block={block} />
      ))}
    </div>
  );
}
