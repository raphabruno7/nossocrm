'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { AIConfigSection } from './components/AIConfigSection';
import { AIFeaturesSection } from './components/AIFeaturesSection';

/**
 * Componente React `AICenterSettings`.
 * @returns {Element} Retorna um valor do tipo `Element`.
 */
export const AICenterSettings: React.FC = () => {
  const t = useTranslations('settings.aiCenter');
  const { profile } = useAuth();
  const { aiOrgEnabled, setAiOrgEnabled } = useCRM();
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
          {t('title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          {t('subtitle')}
        </p>
      </div>

      {/* Org-wide toggle (admin-only) — sempre visível no topo */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-lg">✨</span> {t('enabledTitle')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {t('enabledDescription')}
            </p>
            {!isAdmin && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {t('adminOnly')}
              </p>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={aiOrgEnabled}
              onChange={(e) => setAiOrgEnabled(e.target.checked)}
              disabled={!isAdmin}
              className="sr-only peer"
              aria-label={t('enabledAriaLabel')}
            />
            <div className="w-11 h-6 bg-red-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-red-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500 dark:peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      <AIConfigSection />

      <div className="mt-6">
        <AIFeaturesSection />
      </div>
    </div>
  );
};
