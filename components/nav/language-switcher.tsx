'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { routing } from '@/i18n/routing';

const LOCALE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  vi: '🇻🇳',
};

interface LanguageSwitcherProps {
  switchLabel: string;
  localeLabels: Record<string, string>;
}

export function LanguageSwitcher({ switchLabel, localeLabels }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Derive current locale from the live pathname — never use a server-passed prop
  // which can be stale after client-side navigation.
  const currentLocale =
    routing.locales.find(
      (l) => l !== routing.defaultLocale && pathname.startsWith(`/${l}`)
    ) ?? routing.defaultLocale;

  const handleSwitch = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    // Strip any non-default locale prefix to get the canonical path
    const canonicalPath =
      routing.locales
        .filter((l) => l !== routing.defaultLocale)
        .reduce(
          (p, l) => (p.startsWith(`/${l}/`) || p === `/${l}` ? p.slice(`/${l}`.length) || '/' : p),
          pathname
        );

    const newPath =
      newLocale === routing.defaultLocale
        ? canonicalPath
        : `/${newLocale}${canonicalPath === '/' ? '' : canonicalPath}`;

    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={switchLabel}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{switchLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleSwitch(locale)}
            className="cursor-pointer gap-2"
          >
            <span className="text-base leading-none">{LOCALE_FLAGS[locale]}</span>
            <span>{localeLabels[locale] ?? locale}</span>
            {locale === currentLocale && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
