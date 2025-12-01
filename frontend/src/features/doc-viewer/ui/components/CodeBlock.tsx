import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { CodeBlockProps } from '../../types/document.types';

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract language from className (format: "language-javascript")
  const language = className?.replace('language-', '') || 'text';

  const handleCopy = async () => {
    const text = String(children).replace(/\n$/, '');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inline code (single backtick)
  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 text-sm font-mono">
        {children}
      </code>
    );
  }

  // Code block (triple backtick)
  return (
    <div className="relative group my-4">
      {/* Language badge and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 rounded-t-lg">
        <span className="text-xs text-gray-400 font-mono uppercase">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 rounded transition-colors"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="!mt-0 !rounded-t-none overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
