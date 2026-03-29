import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Building2, Mail, Phone, Plus, Calendar, Pencil, Trash2, Globe, ArrowUpDown, ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';
import { Contact, Company, ContactSortableColumn } from '@/types';
import { StageBadge } from './ContactsStageTabs';

/**
 * Formata uma data para exibição relativa (ex: "Hoje", "Ontem", "Há 3 dias", "15/11/2024")
 */
function formatRelativeDate(
    dateString: string | undefined | null,
    now: Date,
    dateFormatter: Intl.DateTimeFormat,
    labels: {
        none: string;
        today: string;
        yesterday: string;
        daysAgo: (count: number) => string;
        weeksAgo: (count: number) => string;
    }
): string {
    if (!dateString) return labels.none;
    
    const date = new Date(dateString);
    
    // Reset hours for accurate day comparison
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = today.getTime() - dateDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return labels.today;
    if (diffDays === 1) return labels.yesterday;
    if (diffDays < 7) return labels.daysAgo(diffDays);
    if (diffDays < 30) return labels.weeksAgo(Math.floor(diffDays / 7));
    
    // For older dates, show the actual date
    return dateFormatter.format(date);
}

/** Props for sortable column header */
interface SortableHeaderProps {
    label: string;
    sortAriaLabel: string;
    column: ContactSortableColumn;
    currentSort: ContactSortableColumn;
    sortOrder: 'asc' | 'desc';
    onSort: (column: ContactSortableColumn) => void;
}

/** Sortable column header component */
const SortableHeader: React.FC<SortableHeaderProps> = ({ label, sortAriaLabel, column, currentSort, sortOrder, onSort }) => {
    const isActive = currentSort === column;
    
    return (
        <th scope="col" className="px-6 py-4">
            <button
                onClick={() => onSort(column)}
                className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                aria-label={sortAriaLabel}
            >
                {label}
                <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                    {isActive ? (
                        sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    ) : (
                        <ArrowUpDown size={14} />
                    )}
                </span>
            </button>
        </th>
    );
};

interface ContactsListProps {
    viewMode: 'people' | 'companies';
    filteredContacts: Contact[];
    filteredCompanies: Company[];
    contacts: Contact[]; // Needed for company view avatar grouping
    selectedIds: Set<string>;
    toggleSelect: (id: string) => void;
    toggleSelectAll: () => void;
    getCompanyName: (id: string | undefined | null) => string;
    updateContact: (id: string, data: Partial<Contact>) => void;
    convertContactToDeal: (id: string) => void;
    openEditModal: (contact: Contact) => void;
    setDeleteId: (id: string) => void;
    openEditCompanyModal?: (company: Company) => void;
    setDeleteCompanyId?: (id: string) => void;
    onCompanyClick?: (companyId: string) => void;
    // Sorting props
    sortBy?: ContactSortableColumn;
    sortOrder?: 'asc' | 'desc';
    onSort?: (column: ContactSortableColumn) => void;
}

/**
 * Componente React `ContactsList`.
 *
 * @param {ContactsListProps} {
    viewMode,
    filteredContacts,
    filteredCompanies,
    contacts,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    getCompanyName,
    updateContact,
    convertContactToDeal,
    openEditModal,
    setDeleteId,
    sortBy = 'created_at',
    sortOrder = 'desc',
    onSort,
} - Parâmetro `{
    viewMode,
    filteredContacts,
    filteredCompanies,
    contacts,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    getCompanyName,
    updateContact,
    convertContactToDeal,
    openEditModal,
    setDeleteId,
    sortBy = 'created_at',
    sortOrder = 'desc',
    onSort,
}`.
 * @returns {Element} Retorna um valor do tipo `Element`.
 */
export const ContactsList: React.FC<ContactsListProps> = ({
    viewMode,
    filteredContacts,
    filteredCompanies,
    contacts,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    getCompanyName,
    updateContact,
    convertContactToDeal,
    openEditModal,
    setDeleteId,
    openEditCompanyModal,
    setDeleteCompanyId,
    onCompanyClick,
    sortBy = 'created_at',
    sortOrder = 'desc',
    onSort,
}) => {
    const t = useTranslations('contacts.list');
    const locale = useLocale();
    const localeTag = locale === 'pt' ? 'pt-BR' : 'en-US';
    const activeListIds = viewMode === 'people'
        ? filteredContacts.map(c => c.id)
        : filteredCompanies.map(c => c.id);
    const allSelected = activeListIds.length > 0 && selectedIds.size === activeListIds.length;

    const someSelected = selectedIds.size > 0 && selectedIds.size < activeListIds.length;

    // Performance: compute "contacts by company" once (avoids N filters per company row).
    const contactsByCompanyId = React.useMemo(() => {
        const map = new Map<string, Contact[]>();
        for (const c of contacts) {
            const companyId = c.clientCompanyId;
            if (!companyId) continue;
            const list = map.get(companyId);
            if (list) list.push(c);
            else map.set(companyId, [c]);
        }
        return map;
    }, [contacts]);

    // Performance: avoid creating `new Date()` for each row in formatRelativeDate.
    // Memoized para evitar hydration mismatch (server vs client timestamp) e
    // evitar recriação a cada render
    const now = React.useMemo(() => new Date(), []);
    const dateFormatter = React.useMemo(() => new Intl.DateTimeFormat(localeTag), [localeTag]);
    const dateTimeFormatter = React.useMemo(
        () =>
            new Intl.DateTimeFormat(localeTag, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
        [localeTag]
    );
    const relativeDateLabels = React.useMemo(
        () => ({
            none: t('relativeDate.none'),
            today: t('relativeDate.today'),
            yesterday: t('relativeDate.yesterday'),
            daysAgo: (count: number) => t('relativeDate.daysAgo', { count }),
            weeksAgo: (count: number) => t('relativeDate.weeksAgo', { count }),
        }),
        [t]
    );
    const statusLabels = React.useMemo(
        () => ({
            ACTIVE: t('status.active'),
            INACTIVE: t('status.inactive'),
            CHURNED: t('status.lost'),
        }),
        [t]
    );
    
    return (
        <div className="glass rounded-xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                {viewMode === 'people' ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                            <tr>
                                <th scope="col" className="w-12 px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        checked={allSelected}
                                        ref={(el) => { if (el) el.indeterminate = someSelected; }}
                                        onChange={toggleSelectAll}
                                        aria-label={t('selection.allContacts')}
                                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:bg-white/5 dark:border-white/10" 
                                    />
                                </th>
                                {onSort ? (
                                    <SortableHeader
                                        label={t('headers.name')}
                                        sortAriaLabel={t('sortBy', { label: t('headers.name') })}
                                        column="name"
                                        currentSort={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                ) : (
                                    <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.name')}</th>
                                )}
                                <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.stage')}</th>
                                <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.roleCompany')}</th>
                                <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.contact')}</th>
                                <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.status')}</th>
                                {onSort ? (
                                    <SortableHeader
                                        label={t('headers.created')}
                                        sortAriaLabel={t('sortBy', { label: t('headers.created') })}
                                        column="created_at"
                                        currentSort={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                ) : (
                                    <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.created')}</th>
                                )}
                                {onSort ? (
                                    <SortableHeader
                                        label={t('headers.modified')}
                                        sortAriaLabel={t('sortBy', { label: t('headers.modified') })}
                                        column="updated_at"
                                        currentSort={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                ) : (
                                    <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.modified')}</th>
                                )}
                                <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider"><span className="sr-only">{t('headers.actions')}</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredContacts.map((contact) => (
                                <tr key={contact.id} className={`hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group ${selectedIds.has(contact.id) ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.has(contact.id)}
                                            onChange={() => toggleSelect(contact.id)}
                                            aria-label={t('selection.contact', { name: contact.name })}
                                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:bg-white/5 dark:border-white/10" 
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(contact)}
                                                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 text-primary-700 dark:text-primary-200 flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-white/5 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-card"
                                                aria-label={t('actions.editContactAvatar', { name: contact.name || t('fallbacks.unnamedContact') })}
                                                title={contact.name || t('fallbacks.unnamedContact')}
                                            >
                                                {(contact.name || '?').charAt(0)}
                                            </button>
                                            <div>
                                                <span className="font-semibold text-slate-900 dark:text-white block">{contact.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StageBadge stage={contact.stage} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <span className="text-slate-900 dark:text-white font-medium block">{contact.role || t('fallbacks.roleNotInformed')}</span>
                                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                <Building2 size={10} />
                                                <span>{getCompanyName(contact.clientCompanyId)}</span>
                                            </div>
                                            {contact.tags && contact.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {contact.tags.map((tag, idx) => (
                                                        <span key={idx} className="px-1.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-medium">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                                                <Mail size={12} /> {contact.email || '---'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                                                {contact.source === 'WHATSAPP' ? (
                                                    <MessageCircle size={12} className="text-green-500" />
                                                ) : (
                                                    <Phone size={12} />
                                                )}
                                                {contact.phone || '---'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const nextStatus = contact.status === 'ACTIVE' ? 'INACTIVE' : contact.status === 'INACTIVE' ? 'CHURNED' : 'ACTIVE';
                                                    updateContact(contact.id, { status: nextStatus });
                                                }}
                                                aria-label={t('actions.changeStatus', {
                                                    name: contact.name,
                                                    status: contact.status === 'ACTIVE'
                                                        ? t('status.active').toLowerCase()
                                                        : contact.status === 'INACTIVE'
                                                            ? t('status.inactive').toLowerCase()
                                                            : t('status.lost').toLowerCase(),
                                                })}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${contact.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                                                    contact.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' :
                                                        'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                                    }`}
                                            >
                                                {contact.status === 'ACTIVE'
                                                    ? statusLabels.ACTIVE
                                                    : contact.status === 'INACTIVE'
                                                        ? statusLabels.INACTIVE
                                                        : statusLabels.CHURNED}
                                            </button>
                                            <button
                                                onClick={() => convertContactToDeal(contact.id)}
                                                className="p-1 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                                aria-label={t('actions.createOpportunity', { name: contact.name })}
                                            >
                                                <Plus size={14} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs"
                                            title={contact.createdAt ? dateTimeFormatter.format(new Date(contact.createdAt)) : undefined}
                                        >
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>{formatRelativeDate(contact.createdAt, now, dateFormatter, relativeDateLabels)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs"
                                            title={contact.updatedAt ? dateTimeFormatter.format(new Date(contact.updatedAt)) : undefined}
                                        >
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>{formatRelativeDate(contact.updatedAt, now, dateFormatter, relativeDateLabels)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => openEditModal(contact)}
                                                className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                                                aria-label={t('actions.edit', { name: contact.name })}
                                            >
                                                <Pencil size={16} aria-hidden="true" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(contact.id)}
                                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500 transition-colors"
                                                aria-label={t('actions.delete', { name: contact.name })}
                                            >
                                                <Trash2 size={16} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                            <tr>
                                <th scope="col" className="w-12 px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(el) => { if (el) el.indeterminate = someSelected; }}
                                        onChange={toggleSelectAll}
                                        aria-label={t('selection.allCompanies')}
                                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:bg-white/5 dark:border-white/10"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.company')}</th>
                                <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.industry')}</th>
                                <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.createdAt')}</th>
                                <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider">{t('headers.linkedPeople')}</th>
                                <th scope="col" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 font-display text-xs uppercase tracking-wider"><span className="sr-only">{t('headers.actions')}</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredCompanies.map((company) => (
                                <tr key={company.id} className={`hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group ${selectedIds.has(company.id) ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                        type="checkbox"
                                        checked={selectedIds.has(company.id)}
                                        onChange={() => toggleSelect(company.id)}
                                        aria-label={t('selection.company', { name: company.name })}
                                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:bg-white/5 dark:border-white/10"
                                    />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {(() => {
                                                const firstLinkedContact = (contactsByCompanyId.get(company.id) ?? [])[0];
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (firstLinkedContact) openEditModal(firstLinkedContact);
                                                        }}
                                                        disabled={!firstLinkedContact}
                                                        className={`w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-card ${
                                                            firstLinkedContact
                                                                ? 'hover:bg-slate-200 dark:hover:bg-white/15'
                                                                : 'opacity-50 cursor-not-allowed'
                                                        }`}
                                                        aria-label={
                                                            firstLinkedContact
                                                                ? t('actions.openLinkedContact', { name: company.name })
                                                                : t('actions.noLinkedContactsFor', { name: company.name })
                                                        }
                                                        title={
                                                            firstLinkedContact
                                                                ? t('actions.openContactTitle', { name: firstLinkedContact.name || t('fallbacks.unnamedContact') })
                                                                : t('actions.noLinkedContacts')
                                                        }
                                                    >
                                                        <Building2 size={18} />
                                                    </button>
                                                );
                                            })()}
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => onCompanyClick?.(company.id)}
                                                    className="font-semibold text-slate-900 dark:text-white block hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left"
                                                    title={t('actions.viewCompanyContacts', { name: company.name })}
                                                >
                                                    {company.name}
                                                </button>
                                                {company.website && (
                                                    <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
                                                        <Globe size={10} /> {company.website}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-medium">
                                            {company.industry || t('fallbacks.undefinedIndustry')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-600 dark:text-slate-400 text-xs">
                                            {dateFormatter.format(new Date(company.createdAt))}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/*
                                          Performance: this row used to call `contacts.filter(...)` twice per company.
                                          We pre-index contactsByCompanyId above to make this O(C + P) instead of O(C * P).
                                        */}
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {(contactsByCompanyId.get(company.id) ?? []).map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => openEditModal(c)}
                                                    className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-dark-card bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-[10px] font-bold text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-card"
                                                    title={c.name || t('fallbacks.unnamedContact')}
                                                    aria-label={t('actions.editContactAvatar', { name: c.name || t('fallbacks.unnamedContact') })}
                                                >
                                                    {(c.name || '?').charAt(0)}
                                                </button>
                                            ))}
                                            {(contactsByCompanyId.get(company.id) ?? []).length === 0 && (
                                                <span className="text-slate-400 text-xs italic">{t('fallbacks.nobody')}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => openEditCompanyModal?.(company)}
                                                className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                                                aria-label={t('actions.edit', { name: company.name })}
                                            >
                                                <Pencil size={16} aria-hidden="true" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteCompanyId?.(company.id)}
                                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500 transition-colors"
                                                aria-label={t('actions.delete', { name: company.name })}
                                            >
                                                <Trash2 size={16} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
