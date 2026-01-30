import React from "react";

interface PreProps {
  children?: React.ReactNode;
  className?: string;
}

const Pre: React.FC<PreProps> = ({ children, className, ...props }) => {
  return (
    <pre className={className} {...props}>
      {children}
    </pre>
  );
};

export default Pre;
