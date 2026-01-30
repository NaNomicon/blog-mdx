"use client";
import React, { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeProps {
  children?: React.ReactNode;
  className?: string;
}

const Code: React.FC<CodeProps> = ({ children, className = "" }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  // Extract the language from the className
  const matches = className.match(/language-(?<lang>.*)/);
  const language = matches?.groups?.lang || "";

  // Handle copy functionality
  const handleCopy = async () => {
    if (codeRef.current) {
      const codeText = codeRef.current.innerText;
      try {
        await navigator.clipboard.writeText(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy code:", error);
      }
    }
  };

  return (
    <div className="code-block my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-900 py-2 px-4 border-b border-gray-200 dark:border-gray-800">
        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {language || "text"}
        </span>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors",
            "text-gray-600 dark:text-gray-400",
            "hover:bg-gray-200 dark:hover:bg-gray-800",
            "hover:text-gray-900 dark:hover:text-gray-100",
            "focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
          )}
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-white dark:bg-gray-950 p-4 overflow-x-auto">
        <code
          ref={codeRef}
          className={cn(
            className,
            "font-mono text-sm leading-relaxed whitespace-pre"
          )}
        >
          {children}
        </code>
      </pre>
    </div>
  );
};

export default Code;
