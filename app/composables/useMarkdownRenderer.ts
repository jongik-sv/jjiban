/**
 * useMarkdownRenderer Composable
 * TSK-05-04: Document Viewer
 *
 * 책임: Markdown → HTML 변환, sanitization, 코드 하이라이팅
 */

import { computed, unref } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import DOMPurify from 'dompurify';

// 언어 팩 임포트 (5개만 포함 - 번들 크기 최적화)
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';

// 언어 등록
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);

// Vue 언어는 별도로 처리 (highlight.js에 내장되어 있지 않으므로 xml로 대체)
import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('vue', xml);
hljs.registerLanguage('html', xml);

export interface UseMarkdownRendererOptions {
  gfm?: boolean;        // GFM 활성화 (기본: true)
  highlight?: boolean;  // 코드 하이라이팅 (기본: true)
  sanitize?: boolean;   // HTML sanitization (기본: true)
}

export function useMarkdownRenderer(options: UseMarkdownRendererOptions = {}) {
  const {
    gfm = true,
    highlight = true,
    sanitize = true
  } = options;

  // marked 설정
  marked.use({
    gfm,
    breaks: true,
    renderer: {
      // 헤딩에 id 속성 추가 (앵커 링크 지원)
      heading({ tokens, depth }: any) {
        const text = this.parser.parseInline(tokens);
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        return `<h${depth} id="${id}">${text}</h${depth}>`;
      },

      // 외부 링크 보안 설정
      link({ href, title, tokens }: any) {
        const text = this.parser.parseInline(tokens);
        const titleAttr = title ? ` title="${title}"` : '';
        // 외부 링크는 새 탭에서 열기
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
        return `<a href="${href}"${titleAttr}>${text}</a>`;
      },

      // 코드 블록에 하이라이팅 적용
      code({ text, lang }: any) {
        if (highlight && lang && hljs.getLanguage(lang)) {
          try {
            const highlighted = hljs.highlight(text, { language: lang }).value;
            return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>\n`;
          } catch (err) {
            console.error('Highlight error:', err);
          }
        }
        if (highlight) {
          const highlighted = hljs.highlightAuto(text).value;
          return `<pre><code class="hljs">${highlighted}</code></pre>\n`;
        }
        return `<pre><code>${text}</code></pre>\n`;
      }
    }
  });

  // DOMPurify 설정
  const purifyConfig = {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'div', 'span', 'a',
      'ul', 'ol', 'li',
      'code', 'pre',
      'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'strong', 'em', 'del',
      'input', 'br', 'hr'
    ],
    ALLOWED_ATTR: [
      'href', 'id', 'class', 'alt', 'title',
      'type', 'checked', 'disabled',
      'data-*'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'link'],
    ALLOW_DATA_ATTR: true
  };

  /**
   * Markdown → HTML 변환 함수
   */
  function render(markdown: string): string {
    if (!markdown) {
      return '';
    }

    try {
      // 1. Markdown → HTML 변환
      const html = marked.parse(markdown) as string;

      // 2. HTML sanitization (XSS 방지)
      if (sanitize) {
        return DOMPurify.sanitize(html, purifyConfig);
      }

      return html;
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return '<p>문서 렌더링에 실패했습니다</p>';
    }
  }

  /**
   * Reactive 렌더링 (computed)
   */
  function useReactive(markdown: Ref<string> | ComputedRef<string>) {
    return computed(() => render(unref(markdown)));
  }

  return {
    render,
    useReactive
  };
}
