import React from 'react';
import { useTranslations } from 'next-intl';
import { Search, Filter, Plus, Download } from 'lucide-react';
import { CRMCompany } from '@/types';

interface ContactsHeaderProps {
  viewMode: 'people' | 'companies';
  search: string;
  setSearch: (value: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'CHURNED' | 'RISK';
  setStatusFilter: (value: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'CHURNED' | 'RISK') => void;
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  tagFilter: string;
  setTagFilter: (value: string) => void;
  companies: CRMCompany[];
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  openCreateModal: () => void;
  openImportExportModal?: () => void;
}

/**
 * Componente React `ContactsHeader`.
 *
 * @param {ContactsHeaderProps} {
  viewMode,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  isFilterOpen,
  setIsFilterOpen,
  openCreateModal,
} - Parâmetro `{
  viewMode,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  isFilterOpen,
  setIsFilterOpen,
  openCreateModal,
}`.
 * @returns {Element} Retorna um valor do tipo `Element`.
 */
export const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  viewMode,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  companyFilter,
  setCompanyFilter,
  tagFilter,
  setTagFilter,
  companies,
  isFilterOpen,
  setIsFilterOpen,
  openCreateModal,
  openImportExportModal,
}) => {
  const t = useTranslations('contacts.header');
  const sortedCompanies = React.useMemo(
    () => [...companies].sort((a, b) => a.name.localeCompare(b.name)),
    [companies]
  );

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
          {viewMode === 'people' ? t('peopleTitle') : t('companiesTitle')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {viewMode === 'people'
            ? t('peopleSubtitle')
            : t('companiesSubtitle')}
        </p>
      </div>
      <div className="flex gap-3 w-full sm:w-auto flex-wrap">
        {viewMode === 'people' && (
          <select
            value={statusFilter}
            onChange={e =>
              setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'CHURNED' | 'RISK')
            }
            aria-label={t('statusFilterAriaLabel')}
            className="pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white backdrop-blur-sm appearance-none cursor-pointer"
          >
            <option value="ALL">{t('status.all')}</option>
            <option value="ACTIVE">{t('status.active')}</option>
            <option value="INACTIVE">{t('status.inactive')}</option>
            <option value="CHURNED">{t('status.churned')}</option>
            <option value="RISK">{t('status.risk')}</option>
          </select>
        )}
        {viewMode === 'people' && sortedCompanies.length > 0 && (
          <select
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            aria-label={t('companyFilterAriaLabel')}
            className="pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white backdrop-blur-sm appearance-none cursor-pointer max-w-[200px] truncate"
          >
            <option value="ALL">{t('allCategories')}</option>
            {sortedCompanies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
        {viewMode === 'people' && sortedCompanies.length > 0 && (
          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            aria-label={t('tagFilterAriaLabel')}
            className="pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white backdrop-blur-sm appearance-none cursor-pointer max-w-[200px] truncate"
          >
            <option value="ALL">{t('allTags')}</option>
            {sortedCompanies.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        )}
        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={
              viewMode === 'people' ? t('searchPeoplePlaceholder') : t('searchCompaniesPlaceholder')
            }
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white backdrop-blur-sm"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          aria-label={isFilterOpen ? t('closeAdvancedFiltersAriaLabel') : t('openAdvancedFiltersAriaLabel')}
          aria-expanded={isFilterOpen}
          className={`p-2 border rounded-lg transition-colors ${isFilterOpen ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'}`}
        >
          <Filter size={20} aria-hidden="true" />
        </button>
        {viewMode === 'people' && (
          <button
            type="button"
            onClick={openImportExportModal}
            aria-label={t('importExportAriaLabel')}
            className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <Download size={20} aria-hidden="true" />
          </button>
        )}
        <button
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus size={18} /> {viewMode === 'people' ? t('newContact') : t('newCompany')}
        </button>
      </div>
    </div>
  );
};
