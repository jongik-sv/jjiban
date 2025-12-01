import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './components/CodeBlock';
import { MermaidDiagram } from './components/MermaidDiagram';
import type { MarkdownViewerProps } from '../types/document.types';

// Import styles
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div
      className={cn(
        'markdown-viewer prose prose-invert max-w-none',
        'prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
        'prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline',
        'prose-code:text-pink-400 prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-gray-900 prose-pre:p-0',
        'prose-blockquote:border-l-blue-500 prose-blockquote:italic',
        'prose-img:rounded-lg',
        'prose-table:border-collapse prose-th:border prose-th:border-gray-700 prose-th:bg-gray-800 prose-th:p-2',
        'prose-td:border prose-td:border-gray-700 prose-td:p-2',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            // Render Mermaid diagrams
            if (language === 'mermaid') {
              return <MermaidDiagram chart={String(children)} />;
            }

            // Render code blocks with custom component
            return (
              <CodeBlock
                className={className}
                inline={inline}
                {...props}
              >
                {children}
              </CodeBlock>
            );
          },
          // Custom link renderer (open in new tab for external links)
          a({ node, href, children, ...props }) {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          // Custom image renderer
          img({ node, src, alt, ...props }) {
            return (
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="rounded-lg shadow-lg"
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
