'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Languages, Check, Globe } from 'lucide-react';

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

interface LanguageSwitcherV2Props {
  variant?: 'emoji' | 'svg' | 'minimal';
  showLabel?: boolean;
}

export default function LanguageSwitcherV2({ 
  variant = 'emoji', 
  showLabel = true 
}: LanguageSwitcherV2Props) {
  const t = useTranslations('language');
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

  const currentFlag = flagEmojis[locale as keyof typeof flagEmojis];
  const currentLanguage = nativeLanguageNames[locale as keyof typeof nativeLanguageNames];

  const renderFlag = (lang: string) => {
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
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-2 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
          aria-label={t('switchLanguage')}
        >
          {renderFlag(locale)}
          {showLabel && (
            <span className="hidden sm:inline-block transition-opacity duration-200">
              {currentLanguage}
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
          const localizedPath = getLocalizedPath(lang);
          
          return (
            <DropdownMenuItem key={lang} asChild>
              <Link
                href={localizedPath}
                className={`cursor-pointer gap-3 py-3 px-3 transition-all duration-200 flex items-center ${
                  isActive 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-accent/50'
                }`}
                aria-label={`${t('switchTo', { language: nativeName })}`}
                onClick={() => {
                  console.log('Language switch via Link:', {
                    from: locale,
                    to: lang,
                    currentPath: pathname,
                    newPath: localizedPath
                  });
                }}
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
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 