'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Globe, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { routing } from '@/i18n/routing';

interface LanguageSwitcherProps {
  switchLabel: string;
  localeLabels: Record<string, string>;
  currentLocale: string;
}

export function LanguageSwitcher({ switchLabel, localeLabels, currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    // Strip current locale prefix (non-default locales have a /xx prefix)
    let strippedPath = pathname;
    if (currentLocale !== routing.defaultLocale) {
      strippedPath = pathname.replace(new RegExp(`^/${currentLocale}(?=/|$)`), '') || '/';
    }

    // Build the new path with the target locale prefix
    const newPath =
      newLocale === routing.defaultLocale
        ? strippedPath
        : `/${newLocale}${strippedPath}`;

    router.push(newPath);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={switchLabel}
                className="relative group hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <Globe className="h-[1.2rem] w-[1.2rem] transition-all duration-300 group-hover:rotate-12" />
                <span className="sr-only">{switchLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border border-border/50 shadow-lg">
              {routing.locales.map((locale) => (
                <DropdownMenuItem
                  key={locale}
                  onClick={() => handleSwitch(locale)}
                  className="cursor-pointer transition-all duration-300 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                >
                  {locale === currentLocale ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <span className="mr-2 h-4 w-4 inline-block" />
                  )}
                  {localeLabels[locale] ?? locale}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{switchLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}
