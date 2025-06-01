import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfig = {
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30',
    iconClassName: 'text-blue-600 dark:text-blue-400',
    titleClassName: 'text-blue-900 dark:text-blue-100',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
    titleClassName: 'text-yellow-900 dark:text-yellow-100',
  },
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30',
    iconClassName: 'text-green-600 dark:text-green-400',
    titleClassName: 'text-green-900 dark:text-green-100',
  },
  error: {
    icon: XCircle,
    className: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
    iconClassName: 'text-red-600 dark:text-red-400',
    titleClassName: 'text-red-900 dark:text-red-100',
  },
};

export function Callout({ type = 'info', title, children, className }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <Card className={cn(config.className, className, 'my-6')}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconClassName)} />
          <div className="flex-1">
            {title && (
              <h4 className={cn('font-semibold mb-2', config.titleClassName)}>
                {title}
              </h4>
            )}
            <div className="text-sm leading-relaxed [&>*:last-child]:mb-0">
              {children}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 