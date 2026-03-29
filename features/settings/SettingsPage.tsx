import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSettingsController } from './hooks/useSettingsController';
import { TagsManager } from './components/TagsManager';
import { CustomFieldsManager } from './components/CustomFieldsManager';
import { ApiKeysSection } from './components/ApiKeysSection';
import { WebhooksSection } from './components/WebhooksSection';
import { McpSection } from './components/McpSection';
import { DataStorageSettings } from './components/DataStorageSettings';
import { ProductsCatalogManager } from './components/ProductsCatalogManager';
import { AICenterSettings } from './AICenterSettings';

import { UsersPage } from './UsersPage';
import { useAuth } from '@/context/AuthContext';
import { Settings as SettingsIcon, Users, Database, Sparkles, Plug, Package } from 'lucide-react';

type SettingsTab = 'general' | 'products' | 'integrations' | 'ai' | 'data' | 'users';

interface GeneralSettingsProps {
  hash?: string;
  isAdmin: boolean;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ hash, isAdmin }) => {
  const t = useTranslations('settings.page.general');
  const controller = useSettingsController();

  // Scroll to hash element (e.g., #ai-config)
  useEffect(() => {
    if (hash) {
      const elementId = hash.slice(1); // Remove #
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [hash]);


  return (
    <div className="pb-10">
      {/* General Settings */}
      <div className="mb-12">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t('title')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {t('subtitle')}
          </p>
          <select
            aria-label={t('selectAriaLabel')}
            value={controller.defaultRoute}
            onChange={(e) => controller.setDefaultRoute(e.target.value)}
            className="w-full max-w-xs px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all"
          >
            <option value="/dashboard">{t('routes.dashboard')}</option>
            <option value="/inbox-list">{t('routes.inboxList')}</option>
            <option value="/inbox-focus">{t('routes.inboxFocus')}</option>
            <option value="/boards">{t('routes.boards')}</option>
            <option value="/contacts">{t('routes.contacts')}</option>
            <option value="/activities">{t('routes.activities')}</option>
            <option value="/reports">{t('routes.reports')}</option>
          </select>
        </div>
      </div>

      {isAdmin && (
        <>
          <TagsManager
            availableTags={controller.availableTags}
            newTagName={controller.newTagName}
            setNewTagName={controller.setNewTagName}
            onAddTag={controller.handleAddTag}
            onRemoveTag={controller.removeTag}
          />

          <CustomFieldsManager
            customFieldDefinitions={controller.customFieldDefinitions}
            newFieldLabel={controller.newFieldLabel}
            setNewFieldLabel={controller.setNewFieldLabel}
            newFieldType={controller.newFieldType}
            setNewFieldType={controller.setNewFieldType}
            newFieldOptions={controller.newFieldOptions}
            setNewFieldOptions={controller.setNewFieldOptions}
            editingId={controller.editingId}
            onStartEditing={controller.startEditingField}
            onCancelEditing={controller.cancelEditingField}
            onSaveField={controller.handleSaveField}
            onRemoveField={controller.removeCustomField}
          />
        </>
      )}

    </div>
  );
};

const ProductsSettings: React.FC = () => {
  return (
    <div className="pb-10">
      <ProductsCatalogManager />
    </div>
  );
};

const IntegrationsSettings: React.FC = () => {
  type IntegrationsSubTab = 'api' | 'webhooks' | 'mcp';
  const [subTab, setSubTab] = useState<IntegrationsSubTab>('api');

  useEffect(() => {
    const syncFromHash = () => {
    const h = typeof window !== 'undefined' ? (window.location.hash || '').replace('#', '') : '';
    if (h === 'webhooks' || h === 'api' || h === 'mcp') setSubTab(h as IntegrationsSubTab);
    };

    syncFromHash();

    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', syncFromHash);
      return () => window.removeEventListener('hashchange', syncFromHash);
    }
  }, []);

  const setSubTabAndHash = (t: IntegrationsSubTab) => {
    setSubTab(t);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.hash = `#${t}`;
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="pb-10">
      <div className="flex items-center gap-2 mb-6">
        {([
          { id: 'webhooks' as const, label: 'Webhooks' },
          { id: 'api' as const, label: 'API' },
          { id: 'mcp' as const, label: 'MCP' },
        ] as const).map((t) => {
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTabAndHash(t.id)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                active
                  ? 'border-primary-500/50 bg-primary-500/10 text-primary-700 dark:text-primary-300'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {subTab === 'api' && <ApiKeysSection />}
      {subTab === 'webhooks' && <WebhooksSection />}
      {subTab === 'mcp' && <McpSection />}
    </div>
  );
};

interface SettingsPageProps {
  tab?: SettingsTab;
}

/**
 * Componente React `SettingsPage`.
 *
 * @param {SettingsPageProps} { tab: initialTab } - Parâmetro `{ tab: initialTab }`.
 * @returns {Element} Retorna um valor do tipo `Element`.
 */
const SettingsPage: React.FC<SettingsPageProps> = ({ tab: initialTab }) => {
  const t = useTranslations('settings.page.tabs');
  const { profile } = useAuth();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab || 'general');

  // Get hash from URL for scrolling
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  // Determine tab from pathname if available
  useEffect(() => {
    if (pathname?.includes('/settings/ai')) {
      setActiveTab('ai');
    } else if (pathname?.includes('/settings/products')) {
      setActiveTab('products');
    } else if (pathname?.includes('/settings/integracoes')) {
      setActiveTab('integrations');
    } else if (pathname?.includes('/settings/data')) {
      setActiveTab('data');
    } else if (pathname?.includes('/settings/users')) {
      setActiveTab('users');
    } else {
      setActiveTab('general');
    }
  }, [pathname]);

  const tabs = [
    { id: 'general' as SettingsTab, name: t('general'), icon: SettingsIcon },
    ...(profile?.role === 'admin' ? [{ id: 'products' as SettingsTab, name: t('products'), icon: Package }] : []),
    ...(profile?.role === 'admin' ? [{ id: 'integrations' as SettingsTab, name: t('integrations'), icon: Plug }] : []),
    { id: 'ai' as SettingsTab, name: t('ai'), icon: Sparkles },
    { id: 'data' as SettingsTab, name: t('data'), icon: Database },
    ...(profile?.role === 'admin' ? [{ id: 'users' as SettingsTab, name: t('users'), icon: Users }] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsSettings />;
      case 'integrations':
        return <IntegrationsSettings />;
      case 'ai':
        return <AICenterSettings />;
      case 'data':
        return <DataStorageSettings />;
      case 'users':
        return <UsersPage />;
      default:
        return <GeneralSettings hash={hash} isAdmin={profile?.role === 'admin'} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tabs minimalistas */}
      <div className="flex items-center gap-1 mb-8 border-b border-slate-200 dark:border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default SettingsPage;
