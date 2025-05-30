'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Languages, Check, Globe, Loader2 } from 'lucide-react';
import { useTransition, useCallback, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { locales } from '@/i18n';
import { FlagIcon } from '@/components/ui/flag-icons';

// Flag icons for each locale (emoji fallback)
const flagEmojis = {
  en: '🇺🇸', // US flag for English
  vi: '🇻🇳', // Vietnam flag for Vietnamese
} as const;

// Language names in their native language
const nativeLanguageNames = {
  en: 'English',
  vi: 'Tiếng Việt',
} as const;

// Language descriptions
const languageDescriptions = {
  en: 'English (United States)',
  vi: 'Tiếng Việt (Việt Nam)',
} as const;

interface LanguageSwitcherProps {
  variant?: 'emoji' | 'svg' | 'minimal';
  showLabel?: boolean;
}

export default function LanguageSwitcher({ 
  variant = 'emoji', 
  showLabel = true 
}: LanguageSwitcherProps) {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = useCallback((newLocale: string) => {
    if (newLocale === locale || isPending) return; // Don't switch if already selected or pending

    startTransition(() => {
      try {
        // Get the current pathname segments
        const segments = pathname.split('/').filter(Boolean);
        let newPath: string;
        
        // Check if the first segment is a locale
        if (segments.length > 0 && locales.includes(segments[0] as any)) {
          // Current path has locale prefix
          const pathWithoutLocale = '/' + segments.slice(1).join('/');
          newPath = newLocale === 'en' 
            ? pathWithoutLocale || '/'
            : `/${newLocale}${pathWithoutLocale}`;
        } else {
          // Current path doesn't have locale prefix (default locale)
          newPath = newLocale === 'en' 
            ? pathname
            : `/${newLocale}${pathname}`;
        }

        // Ensure the path is properly formatted
        if (newPath !== '/' && newPath.endsWith('/')) {
          newPath = newPath.slice(0, -1);
        }

        console.log('Switching language:', { 
          from: locale, 
          to: newLocale, 
          currentPath: pathname, 
          newPath,
          segments 
        });
        
        // Close the dropdown first
        setIsOpen(false);
        
        // Use window.location for more reliable navigation
        if (typeof window !== 'undefined') {
          window.location.href = newPath;
        } else {
          // Fallback to router.push for SSR
          router.push(newPath);
        }
      } catch (error) {
        console.error('Error switching language:', error);
        // Fallback: try simple router navigation
        const fallbackPath = newLocale === 'en' ? '/' : `/${newLocale}`;
        router.push(fallbackPath);
      }
    });
  }, [locale, pathname, router, isPending]);

  const currentFlag = flagEmojis[locale as keyof typeof flagEmojis];
  const currentLanguage = nativeLanguageNames[locale as keyof typeof nativeLanguageNames];

  const renderFlag = useCallback((lang: string) => {
    switch (variant) {
      case 'svg':
        return <FlagIcon locale={lang} className="w-4 h-3 rounded-sm border border-border/20 shadow-sm" />;
      case 'emoji':
        return <span className="text-base leading-none select-none">{flagEmojis[lang as keyof typeof flagEmojis]}</span>;
      case 'minimal':
        return <Globe className="h-3 w-3 opacity-60" />;
      default:
        return <span className="text-base leading-none select-none">{flagEmojis[lang as keyof typeof flagEmojis]}</span>;
    }
  }, [variant]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-2 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
          aria-label={t('switchLanguage')}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            renderFlag(locale)
          )}
          {showLabel && (
            <span className="hidden sm:inline-block transition-opacity duration-200">
              {isPending ? t('switching') : currentLanguage}
            </span>
          )}
          <Languages className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[220px] animate-in fade-in-0 zoom-in-95 duration-200"
        sideOffset={4}
      >
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
          {t('switchLanguage')}
        </div>
        {locales.map((lang) => {
          const nativeName = nativeLanguageNames[lang as keyof typeof nativeLanguageNames];
          const description = languageDescriptions[lang as keyof typeof languageDescriptions];
          const isActive = locale === lang;
          
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => switchLanguage(lang)}
              className={`cursor-pointer gap-3 py-3 px-3 transition-all duration-200 ${
                isActive 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-accent/50'
              } ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
              aria-label={`${t('switchTo', { language: nativeName })}`}
              disabled={isPending || isActive}
            >
              <div className="flex items-center gap-3 w-full">
                {renderFlag(lang)}
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{nativeName}</span>
                    {isActive && (
                      <Check className="h-3 w-3 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground leading-tight">
                    {description}
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
        
        {isPending && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t('switching')}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 