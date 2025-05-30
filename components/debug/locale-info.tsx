'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LocaleInfo() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Locale Information</CardTitle>
        <CardDescription>
          Real-time information about the current locale and URL structure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Current Locale (Hook)</p>
            <Badge variant="outline">{locale}</Badge>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Current URL</p>
            <code className="text-xs bg-muted px-2 py-1 rounded block">
              {pathname}
            </code>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">URL Locale</p>
            <Badge variant="secondary">
              {pathname.split('/')[1] || 'en (default)'}
            </Badge>
          </div>
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            The locale should match between the hook and URL. If they don't match, there might be a routing issue.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 