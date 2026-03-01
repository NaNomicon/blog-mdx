import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function NotFound() {
  const t = await getTranslations('Common');

  return (
    <div className="container flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">{t('notFound')}</p>
      <Link href="/" className="mt-8 underline hover:no-underline">
        {t('back')}
      </Link>
    </div>
  );
}
