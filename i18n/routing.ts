import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'vi'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'  // English URLs: /blog/slug, Vietnamese: /vi/blog/slug
});
