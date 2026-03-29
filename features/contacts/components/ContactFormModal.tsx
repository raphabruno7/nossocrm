import React, { useId, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Contact } from '@/types';
import { DebugFillButton } from '@/components/debug/DebugFillButton';
import { fakeContact } from '@/lib/debug';
import { FocusTrap, useFocusReturn } from '@/lib/a11y';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  companyName: string;
  tags: string[];
}

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ContactFormData;
  setFormData: (data: ContactFormData) => void;
  editingContact: Contact | null;
  createFakeContactsBatch?: (count: number) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Componente React `ContactFormModal`.
 *
 * @param {ContactFormModalProps} {
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingContact,
} - Parâmetro `{
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingContact,
}`.
 * @returns {Element | null} Retorna um valor do tipo `Element | null`.
 */
export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingContact,
  createFakeContactsBatch,
  isSubmitting = false,
}) => {
  const headingId = useId();
  const t = useTranslations('contacts.contactForm');
  useFocusReturn({ enabled: isOpen });
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  
  if (!isOpen) return null;

  const fillWithFakeData = () => {
    const fake = fakeContact();
    setFormData({
      name: fake.name,
      email: fake.email,
      phone: fake.phone,
      role: fake.role,
      companyName: fake.companyName,
      tags: [],
    });
  };

  return (
    <FocusTrap active={isOpen} onEscape={onClose}>
      <div 
        className="fixed inset-0 md:left-[var(--app-sidebar-width,0px)] z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={(e) => {
          // Close only when clicking the backdrop (outside the panel).
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 id={headingId} className="text-lg font-bold text-slate-900 dark:text-white font-display">
                {editingContact ? t('editTitle') : t('createTitle')}
              </h2>
              <DebugFillButton onClick={fillWithFakeData} />
              {createFakeContactsBatch && (
                <DebugFillButton
                  onClick={async () => {
                    setIsCreatingBatch(true);
                    try {
                      await createFakeContactsBatch(10);
                      onClose();
                    } finally {
                      setIsCreatingBatch(false);
                    }
                  }}
                  label={isCreatingBatch ? t('creatingBatch') : t('fakeBatch')}
                  variant="secondary"
                  className="ml-1"
                  disabled={isCreatingBatch}
                />
              )}
            </div>
            <button
              onClick={onClose}
              aria-label={t('closeAriaLabel')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white focus-visible-ring rounded"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              {t('fullName')}
            </label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('fullNamePlaceholder')}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('email')}</label>
            <input
              required
              type="email"
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                {t('phone')}
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t('phonePlaceholder')}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('role')}</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t('rolePlaceholder')}
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              {t('company')}
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('companyPlaceholder')}
              value={formData.companyName}
              onChange={e => setFormData({ ...formData, companyName: e.target.value })}
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {editingContact
                ? t('companyHintEdit')
                : t('companyHintCreate')}
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              {t('tags')}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(formData.tags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) })}
                    className="hover:text-red-500 transition-colors"
                    aria-label={t('removeTag', { tag })}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('tagsPlaceholder')}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !(formData.tags || []).includes(val)) {
                    setFormData({ ...formData, tags: [...(formData.tags || []), val] });
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
          </div>

            <button
            type="submit"
              disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 rounded-lg mt-2 shadow-lg shadow-primary-600/20 transition-all"
          >
            {isSubmitting ? t('creating') : (editingContact ? t('save') : t('create'))}
          </button>
        </form>
        </div>
      </div>
    </FocusTrap>
  );
};
