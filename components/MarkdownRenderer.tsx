import ReactMarkdown, { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

// --- Iconos SVG Manuales ---
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5 0M18 3.75h-7.5a1.125 1.125 0 0 0-1.125 1.125v13.5c0 .621.504 1.125 1.125 1.125H18a1.125 1.125 0 0 0 1.125-1.125V4.875A1.125 1.125 0 0 0 18 3.75Z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-green-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copiar código"
      className="absolute right-2 top-2 z-10 rounded-md bg-white/10 p-2 text-gray-300 opacity-0 transition-all hover:bg-white/20 hover:text-white group-hover:opacity-100"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
};

//Aqui se especifican los estilos para cada etiqueta 
const MarkdownComponents: Components = {
    // --- Títulos ---
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white text-center">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-100">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-medium mt-4 mb-2 text-gray-800 dark:text-gray-200">
      {children}
    </h3>
  ),

  // --- Listas ---
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1">
      {children}
    </li>
  ),

  // --- Párrafos y Enlaces ---
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
      {children}
    </p>
  ),
  a: ({ children, href }) => (
    <a 
      href={href} 
      className="text-blue-600 hover:underline dark:text-blue-400" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  //Bloques de codigo
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match;
    const content = String(children).replace(/\n$/, '');

    if (isInline) {
      return (
        <code className="rounded px-1.5 py-0.5 font-mono text-base dark:bg-gray-800" 
        style={{padding:0,
          paddingInlineStart:0,
          margin:0
        }}
        {...props}>
          {children}
        </code>
      );
    }

    return (
      <div className="group relative">
        {/* Botón de copiar */}
        <CopyButton text={content} />
        
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={match[1]}
          PreTag="div"
          // Quitamos los márgenes por defecto de Prism para que Tailwind controle el espaciado
          customStyle={{ margin: -10, borderRadius: '0.5rem',
            fontSize: '1rem', // Aquí defines el tamaño (p.ej. 0.875rem para text-sm)
            lineHeight: '1.4',            
            
          }}
          codeTagProps={{
            style: {
              fontSize: 'inherit', // Hereda del contenedor
              fontFamily: 'var(--font-mono)',
            }
          }}                    
        >
          {content}
        </SyntaxHighlighter>
      </div>
    );
  },
};

export default function MarkdownRenderer ({ content }: { content: string }) {
  return (
    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-code:{text-lg}">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        components={MarkdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

