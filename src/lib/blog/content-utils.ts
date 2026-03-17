import type { ContentBlock } from './types';

/**
 * Convert ContentBlock[] to HTML for the rich text editor
 */
export function contentBlocksToHtml(blocks: ContentBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`;
        case 'paragraph':
          return `<p>${formatInlineText(block.text)}</p>`;
        case 'image':
          return `<img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt)}" />`;
        case 'list': {
          const tag = block.style === 'numbered' ? 'ol' : 'ul';
          const items = block.items.map((item) => `<li>${formatInlineText(item)}</li>`).join('');
          return `<${tag}>${items}</${tag}>`;
        }
        case 'quote':
          return `<blockquote><p>${formatInlineText(block.text)}</p></blockquote>`;
        case 'divider':
          return '<hr />';
        case 'callout':
          return `<p>${block.emoji ? block.emoji + ' ' : ''}${formatInlineText(block.text)}</p>`;
        case 'code':
          return `<pre><code>${escapeHtml(block.code)}</code></pre>`;
        case 'faq':
          return `<div data-type="faq">${block.items.map((item) => `<div data-faq-item><dt>${escapeHtml(item.question)}</dt><dd>${escapeHtml(item.answer)}</dd></div>`).join('')}</div>`;
        default:
          return '';
      }
    })
    .join('\n');
}

/**
 * Convert HTML from the rich text editor to ContentBlock[]
 */
export function htmlToContentBlocks(html: string): ContentBlock[] {
  if (!html || html.trim() === '' || html === '<p></p>') return [];

  // Use DOMParser in browser
  if (typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: ContentBlock[] = [];

  const children = doc.body.childNodes;

  for (let i = 0; i < children.length; i++) {
    const node = children[i];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({ type: 'paragraph', text });
      }
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'h1':
        blocks.push({ type: 'heading', level: 2, text: getTextContent(el) });
        break;
      case 'h2':
        blocks.push({ type: 'heading', level: 2, text: getTextContent(el) });
        break;
      case 'h3':
        blocks.push({ type: 'heading', level: 3, text: getTextContent(el) });
        break;
      case 'p': {
        // Check if it contains an image
        const img = el.querySelector('img');
        if (img) {
          blocks.push({
            type: 'image',
            url: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
          });
        } else {
          const text = getInlineText(el);
          if (text.trim()) {
            blocks.push({ type: 'paragraph', text });
          }
        }
        break;
      }
      case 'img':
        blocks.push({
          type: 'image',
          url: el.getAttribute('src') || '',
          alt: el.getAttribute('alt') || '',
        });
        break;
      case 'ul':
        blocks.push({
          type: 'list',
          style: 'bullet',
          items: Array.from(el.querySelectorAll('li')).map((li) => getInlineText(li)),
        });
        break;
      case 'ol':
        blocks.push({
          type: 'list',
          style: 'numbered',
          items: Array.from(el.querySelectorAll('li')).map((li) => getInlineText(li)),
        });
        break;
      case 'blockquote':
        blocks.push({
          type: 'quote',
          text: getInlineText(el),
        });
        break;
      case 'hr':
        blocks.push({ type: 'divider' });
        break;
      case 'pre': {
        const code = el.querySelector('code');
        blocks.push({
          type: 'code',
          code: code ? code.textContent || '' : el.textContent || '',
          language: '',
        });
        break;
      }
      case 'div': {
        if (el.getAttribute('data-type') === 'faq') {
          const faqItems: { question: string; answer: string }[] = [];
          const itemEls = el.querySelectorAll('[data-faq-item]');
          itemEls.forEach((itemEl) => {
            const dt = itemEl.querySelector('dt');
            const dd = itemEl.querySelector('dd');
            if (dt && dd) {
              faqItems.push({
                question: dt.textContent?.trim() || '',
                answer: dd.textContent?.trim() || '',
              });
            }
          });
          if (faqItems.length > 0) {
            blocks.push({ type: 'faq', items: faqItems });
          }
          break;
        }
        const divText = getInlineText(el);
        if (divText.trim()) {
          blocks.push({ type: 'paragraph', text: divText });
        }
        break;
      }
      default: {
        const text = getInlineText(el);
        if (text.trim()) {
          blocks.push({ type: 'paragraph', text });
        }
        break;
      }
    }
  }

  return blocks;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInlineText(text: string): string {
  // Convert markdown-style formatting to HTML
  let result = escapeHtml(text);
  // Bold **text**
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Links [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return result;
}

function getTextContent(el: HTMLElement): string {
  return el.textContent?.trim() || '';
}

function getInlineText(el: HTMLElement): string {
  // Convert inline HTML back to simple text with markdown-style formatting
  let result = '';
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent || '';
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const childEl = child as HTMLElement;
      const tag = childEl.tagName.toLowerCase();
      const innerText = getInlineText(childEl);
      switch (tag) {
        case 'strong':
        case 'b':
          result += `**${innerText}**`;
          break;
        case 'em':
        case 'i':
          result += `*${innerText}*`;
          break;
        case 'a':
          result += `[${innerText}](${childEl.getAttribute('href') || ''})`;
          break;
        case 'p':
          result += innerText;
          break;
        default:
          result += innerText;
          break;
      }
    }
  }
  return result;
}
