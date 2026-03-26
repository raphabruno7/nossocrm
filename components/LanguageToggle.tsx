'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function LanguageToggle() {
  const t = useTranslations('language');
  const router = useRouter();

  const toggle = () => {
    const current = document.cookie.match(/locale=([^;]+)/)?.[1] ?? 'pt';
    const next = current === 'pt' ? 'en' : 'pt';
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      className="text-xs font-semibold px-2 py-1 rounded-md border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
      title={`Switch to ${t('toggle')}`}
    >
      {t('current')}
    </button>
  );
}
