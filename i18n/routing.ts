import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'vi'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'  // English URLs: /blog/slug, Vietnamese: /vi/blog/slug
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
