"use client";
import type React from "react";
import { cn } from "@/lib/utils";

interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}

const InlineCode: React.FC<InlineCodeProps> = ({ children, className }) => {
  return (
    <code
      className={cn(
        "relative rounded px-[0.4rem] py-[0.2rem] font-mono text-sm font-medium",
        "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
        "border border-gray-200 dark:border-gray-700",
        "transition-colors duration-200",
        className
      )}
    >
      {children}
    </code>
  );
};

export default InlineCode;
