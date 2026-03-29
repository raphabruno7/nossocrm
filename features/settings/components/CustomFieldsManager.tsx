import React from 'react';
import { PenTool, Pencil, Check, Plus, List, Tag, Trash2 } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { CustomFieldDefinition, CustomFieldType } from '@/types';
import { useTranslations } from 'next-intl';

interface CustomFieldsManagerProps {
  customFieldDefinitions: CustomFieldDefinition[];
  newFieldLabel: string;
  setNewFieldLabel: (label: string) => void;
  newFieldType: CustomFieldType;
  setNewFieldType: (type: CustomFieldType) => void;
  newFieldOptions: string;
  setNewFieldOptions: (options: string) => void;
  editingId: string | null;
  onStartEditing: (field: CustomFieldDefinition) => void;
  onCancelEditing: () => void;
  onSaveField: () => void;
  onRemoveField: (id: string) => void;
}

/**
 * Componente React `CustomFieldsManager`.
 *
 * @param {CustomFieldsManagerProps} {
  customFieldDefinitions,
  newFieldLabel,
  setNewFieldLabel,
  newFieldType,
  setNewFieldType,
  newFieldOptions,
  setNewFieldOptions,
  editingId,
  onStartEditing,
  onCancelEditing,
  onSaveField,
  onRemoveField
} - Parâmetro `{
  customFieldDefinitions,
  newFieldLabel,
  setNewFieldLabel,
  newFieldType,
  setNewFieldType,
  newFieldOptions,
  setNewFieldOptions,
  editingId,
  onStartEditing,
  onCancelEditing,
  onSaveField,
  onRemoveField
}`.
 * @returns {Element} Retorna um valor do tipo `Element`.
 */
export const CustomFieldsManager: React.FC<CustomFieldsManagerProps> = ({
  customFieldDefinitions,
  newFieldLabel,
  setNewFieldLabel,
  newFieldType,
  setNewFieldType,
  newFieldOptions,
  setNewFieldOptions,
  editingId,
  onStartEditing,
  onCancelEditing,
  onSaveField,
  onRemoveField
}) => {
  const t = useTranslations('settings.customFields');
  return (
    <SettingsSection title={t('title')} icon={PenTool}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
        {t('description')}
      </p>

      <div className={`p-4 rounded-xl border transition-all mb-6 ${editingId ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/20' : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5'}`}>
        {editingId && (
          <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Pencil size={12} /> {t('editing')}
          </div>
        )}
        <div className="flex gap-3 items-end mb-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('nameLabel')}</label>
            <input
              type="text"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>
          <div className="w-40">
            <label htmlFor="custom-field-type" className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('typeLabel')}</label>
            <select
              id="custom-field-type"
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value as CustomFieldType)}
              className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            >
              <option value="text">{t('types.text')}</option>
              <option value="number">{t('types.number')}</option>
              <option value="date">{t('types.date')}</option>
              <option value="select">{t('types.select')}</option>
            </select>
          </div>
          <div className="flex gap-2">
            {editingId && (
              <button
                onClick={onCancelEditing}
                className="bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 px-3 py-2 rounded-lg text-sm font-bold transition-colors h-[38px] border border-slate-200 dark:border-white/10"
              >
                {t('cancel')}
              </button>
            )}
            <button
              onClick={onSaveField}
              disabled={!newFieldLabel.trim()}
              className={`${editingId ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-primary-600 hover:bg-primary-500 shadow-primary-600/20'} text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors h-[38px] shadow-lg`}
            >
              {editingId ? <Check size={16} /> : <Plus size={16} />}
              {editingId ? t('save') : t('create')}
            </button>
          </div>
        </div>

        {newFieldType === 'select' && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-200">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2">
              <List size={12} /> {t('optionsLabel')}
            </label>
            <input
              type="text"
              value={newFieldOptions}
              onChange={(e) => setNewFieldOptions(e.target.value)}
              placeholder={t('optionsPlaceholder')}
              className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">{t('optionsHint')}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {customFieldDefinitions.map(field => (
          <div key={field.id} className={`flex items-center justify-between p-3 bg-white dark:bg-white/5 border rounded-lg group transition-colors ${editingId === field.id ? 'border-amber-400 dark:border-amber-500/50 ring-1 ring-amber-400/30' : 'border-slate-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Tag size={14} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{field.label}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                  <span>{field.key}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="uppercase">{field.type}</span>
                  {field.options && (
                    <>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-primary-500">{t('optionsCount', { count: field.options.length })}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onStartEditing(field)}
                className="text-slate-400 hover:text-amber-500 p-2 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                title={t('editField')}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onRemoveField(field.id)}
                className="text-slate-400 hover:text-red-500 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title={t('removeField')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {customFieldDefinitions.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-4 italic">{t('empty')}</p>
        )}
      </div>
    </SettingsSection>
  );
};
