import React from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Activity, Deal } from '@/types';

interface ActivityFormData {
  title: string;
  type: Activity['type'];
  date: string;
  time: string;
  description: string;
  dealId: string;
}

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ActivityFormData;
  setFormData: (data: ActivityFormData) => void;
  editingActivity: Activity | null;
  deals: Deal[];
}

/**
 * Componente React `ActivityFormModal`.
 *
 * @param {ActivityFormModalProps} {
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingActivity,
  deals,
} - Parâmetro `{
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingActivity,
  deals,
}`.
 * @returns {Element | null} Retorna um valor do tipo `Element | null`.
 */
export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingActivity,
  deals,
}) => {
  const t = useTranslations('activities.form');
  const titleId = React.useId();
  const typeId = React.useId();
  const dealId = React.useId();
  const dateId = React.useId();
  const timeId = React.useId();
  const descriptionId = React.useId();
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    // passive: true porque não usamos preventDefault() - permite scroll mais fluido
    document.addEventListener('keydown', handleEscape, { passive: true });
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 md:left-[var(--app-sidebar-width,0px)] z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        // Close only when clicking the backdrop (outside the panel).
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 max-h-[calc(100dvh-2rem)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            {editingActivity ? t('editTitle') : t('createTitle')}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('closeAriaLabel')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4 overflow-auto pb-[calc(1.25rem+var(--app-safe-area-bottom,0px))]">
          <div>
            <label htmlFor={titleId} className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('titleLabel')}</label>
            <input
              id={titleId}
              required
              type="text"
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('titlePlaceholder')}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={typeId} className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('typeLabel')}</label>
              <select
                id={typeId}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.type}
                onChange={e =>
                  setFormData({ ...formData, type: e.target.value as Activity['type'] })
                }
              >
                <option value="CALL">{t('types.call')}</option>
                <option value="MEETING">{t('types.meeting')}</option>
                <option value="EMAIL">{t('types.email')}</option>
                <option value="TASK">{t('types.task')}</option>
              </select>
            </div>
            <div>
              <label htmlFor={dealId} className="block text-xs font-bold text-slate-500 uppercase mb-1">
                {t('dealLabel')}
              </label>
              <select
                id={dealId}
                required={!editingActivity}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.dealId}
                onChange={e => setFormData({ ...formData, dealId: e.target.value })}
              >
                <option value="">{t('selectPlaceholder')}</option>
                {deals.map(deal => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={dateId} className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('dateLabel')}</label>
              <input
                id={dateId}
                required
                type="date"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor={timeId} className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('timeLabel')}</label>
              <input
                id={timeId}
                required
                type="time"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor={descriptionId} className="block text-xs font-bold text-slate-500 uppercase mb-1">
              {t('descriptionLabel')}
            </label>
            <textarea
              id={descriptionId}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
              placeholder={t('descriptionPlaceholder')}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 rounded-lg mt-2 shadow-lg shadow-primary-600/20 transition-all"
          >
            {editingActivity ? t('save') : t('create')}
          </button>
        </form>
      </div>
    </div>
  );
};
