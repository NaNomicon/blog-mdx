import React from 'react';
import { generateSlug } from '@/lib/utils';
import { LinkIcon } from 'lucide-react';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({ level, children, className, ...props }) => {
  // Extract text content from children for slug generation
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return node.toString();
    if (React.isValidElement(node)) {
      return getTextContent(node.props.children);
    }
    if (Array.isArray(node)) {
      return node.map(getTextContent).join('');
    }
    return '';
  };

  const textContent = getTextContent(children);
  const id = generateSlug(textContent);

  const baseClasses = 'group relative scroll-mt-20 flex items-start gap-2';
  const levelClasses = {
    1: 'text-4xl font-black pb-4',
    2: 'text-3xl font-bold pb-4',
    3: 'text-2xl font-semibold pb-4',
    4: 'text-xl font-medium pb-4',
    5: 'text-lg font-normal pb-4',
    6: 'text-base font-light pb-4',
  };

  const combinedClassName = `${baseClasses} ${levelClasses[level]} ${className || ''}`;

  const linkElement = (
    <a
      href={`#${id}`}
      className="flex-shrink-0 opacity-60 md:opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mt-1 md:mt-0.5 touch-manipulation"
      aria-label={`Link to ${textContent}`}
      title={`Link to this section: ${textContent}`}
    >
      <LinkIcon size={level <= 2 ? 20 : 16} className="flex-shrink-0" />
    </a>
  );

  const contentWrapper = (
    <span className="flex-1 min-w-0">
      {children}
    </span>
  );

  const commonProps = {
    id,
    className: combinedClassName,
    ...props,
  };

  switch (level) {
    case 1:
      return (
        <h1 {...commonProps}>
          {contentWrapper}
          {linkElement}
        </h1>
      );
    case 2:
      return (
        <h2 {...commonProps}>
          {contentWrapper}
          {linkElement}
        </h2>
      );
    case 3:
      return (
        <h3 {...commonProps}>
          {contentWrapper}
          {linkElement}
        </h3>
      );
    case 4:
      return (
        <h4 {...commonProps}>
          {contentWrapper}
          {linkElement}
        </h4>
      );
    case 5:
      return (
        <h5 {...commonProps}>
          {contentWrapper}
          {linkElement}
        </h5>
      );
    case 6:
      return (
        <h6 {...commonProps}>
          {contentWrapper}
          {linkElement}
        </h6>
      );
    default:
      return (
        <h2 {...commonProps}>
          {contentWrapper}
          {linkElement}
        </h2>
      );
  }
};

// Export individual heading components
export const H1: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={1} {...props} />
);

export const H2: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={2} {...props} />
);

export const H3: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={3} {...props} />
);

export const H4: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={4} {...props} />
);

export const H5: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={5} {...props} />
);

export const H6: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={6} {...props} />
);

export default Heading; 