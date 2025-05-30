'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { locales } from '@/i18n';

export function PathTest() {
  const locale = useLocale();
  const pathname = usePathname();

  const getLocalizedPath = (targetLocale: string) => {
    // Get the current pathname segments
    const segments = pathname.split('/').filter(Boolean);
    
    // Check if the first segment is a locale
    if (segments.length > 0 && locales.includes(segments[0] as any)) {
      // Current path has locale prefix
      const pathWithoutLocale = '/' + segments.slice(1).join('/');
      return targetLocale === 'en' 
        ? pathWithoutLocale || '/'
        : `/${targetLocale}${pathWithoutLocale}`;
    } else {
      // Current path doesn't have locale prefix (default locale)
      return targetLocale === 'en' 
        ? pathname
        : `/${targetLocale}${pathname}`;
    }
  };

  const segments = pathname.split('/').filter(Boolean);
  const hasLocalePrefix = segments.length > 0 && locales.includes(segments[0] as any);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Path Generation Test</CardTitle>
        <CardDescription>
          Debug information for language switching path generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Current State</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Locale:</strong> <Badge variant="outline">{locale}</Badge></p>
              <p><strong>Pathname:</strong> <code className="bg-muted px-1 rounded">{pathname}</code></p>
              <p><strong>Segments:</strong> <code className="bg-muted px-1 rounded">[{segments.join(', ')}]</code></p>
              <p><strong>Has Locale Prefix:</strong> <Badge variant={hasLocalePrefix ? "default" : "secondary"}>{hasLocalePrefix ? "Yes" : "No"}</Badge></p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Generated Paths</h4>
            <div className="space-y-1 text-sm">
              {locales.map((lang) => {
                const path = getLocalizedPath(lang);
                const isActive = locale === lang;
                return (
                  <div key={lang} className="flex items-center gap-2">
                    <Badge variant={isActive ? "default" : "outline"}>{lang}</Badge>
                    <code className="bg-muted px-1 rounded text-xs">{path}</code>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <h4 className="font-medium mb-2">Test Links</h4>
          <div className="flex gap-2">
            {locales.map((lang) => {
              const path = getLocalizedPath(lang);
              const isActive = locale === lang;
              return (
                <a
                  key={lang}
                  href={path}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  onClick={(e) => {
                    console.log('Test link clicked:', {
                      from: locale,
                      to: lang,
                      currentPath: pathname,
                      newPath: path
                    });
                  }}
                >
                  {lang.toUpperCase()}
                </a>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 