'use client';

import { useLocale, useTranslations } from 'next-intl';
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
import { routing, useRouter, usePathname } from '@/i18n/routing';

export function LanguageSwitcher() {
  const t = useTranslations('I18n');
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
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
                aria-label={t('switchLanguage')}
                className="relative group hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <Globe className="h-[1.2rem] w-[1.2rem] transition-all duration-300 group-hover:rotate-12" />
                <span className="sr-only">{t('switchLanguage')}</span>
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
                  {t(`locales.${locale}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('switchLanguage')}</p>
      </TooltipContent>
    </Tooltip>
  );
}
