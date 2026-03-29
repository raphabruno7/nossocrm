import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Activity, Deal } from '@/types';
import { Modal, ModalForm } from '@/components/ui/Modal';
import {
  InputField,
  SelectField,
  TextareaField,
  SubmitButton,
} from '@/components/ui/FormField';
import { activityFormSchema } from '@/lib/validations/schemas';
import type { ActivityFormData } from '@/lib/validations/schemas';

type FormActivityType = 'CALL' | 'MEETING' | 'EMAIL' | 'TASK';

interface ActivityFormModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ActivityFormData) => void;
  editingActivity: Activity | null;
  deals: Deal[];
}

// Helper to get safe activity type for form
const getSafeActivityType = (type?: Activity['type']): FormActivityType => {
  const validTypes: FormActivityType[] = ['CALL', 'MEETING', 'EMAIL', 'TASK'];
  if (type && validTypes.includes(type as FormActivityType)) {
    return type as FormActivityType;
  }
  return 'CALL';
};

/**
 * Componente React `ActivityFormModalV2`.
 *
 * @param {ActivityFormModalV2Props} {
  isOpen,
  onClose,
  onSubmit,
  editingActivity,
  deals,
} - Parâmetro `{
  isOpen,
  onClose,
  onSubmit,
  editingActivity,
  deals,
}`.
 * @returns {Element} Retorna um valor do tipo `Element`.
 */
export const ActivityFormModalV2: React.FC<ActivityFormModalV2Props> = ({
  isOpen,
  onClose,
  onSubmit,
  editingActivity,
  deals,
}) => {
  const t = useTranslations('activities.form');
  const defaultDate = new Date().toISOString().split('T')[0];
  const defaultTime = new Date().toTimeString().slice(0, 5);
  const activityTypeOptions = [
    { value: 'CALL', label: t('types.call') },
    { value: 'MEETING', label: t('types.meeting') },
    { value: 'EMAIL', label: t('types.email') },
    { value: 'TASK', label: t('types.task') },
  ];

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema) as any,
    defaultValues: {
      title: editingActivity?.title || '',
      type: getSafeActivityType(editingActivity?.type),
      date: editingActivity?.date?.split('T')[0] || defaultDate,
      time: editingActivity?.date?.split('T')[1]?.slice(0, 5) || defaultTime,
      description: editingActivity?.description || '',
      dealId: editingActivity?.dealId || '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  // Reset form when modal opens with different activity
  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: editingActivity?.title || '',
        type: getSafeActivityType(editingActivity?.type),
        date: editingActivity?.date?.split('T')[0] || defaultDate,
        time: editingActivity?.date?.split('T')[1]?.slice(0, 5) || defaultTime,
        description: editingActivity?.description || '',
        dealId: editingActivity?.dealId || '',
      });
    }
  }, [isOpen, editingActivity, reset]);

  const handleFormSubmit = (data: ActivityFormData) => {
    onSubmit(data);
    onClose();
    reset();
  };

  const dealOptions = deals.map(deal => ({
    value: deal.id,
    label: deal.title,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingActivity ? t('editTitle') : t('createTitle')}
    >
      <ModalForm onSubmit={handleSubmit(handleFormSubmit)}>
        <InputField
          label={t('titleLabel')}
          placeholder={t('titlePlaceholder')}
          error={errors.title}
          registration={register('title')}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label={t('typeLabel')}
            options={activityTypeOptions}
            error={errors.type}
            registration={register('type')}
          />
          <SelectField
            label={t('dealLabel')}
            options={dealOptions}
            placeholder={t('selectPlaceholder')}
            error={errors.dealId}
            registration={register('dealId')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label={t('dateLabel')}
            type="date"
            error={errors.date}
            registration={register('date')}
          />
          <InputField
            label={t('timeLabel')}
            type="time"
            error={errors.time}
            registration={register('time')}
          />
        </div>

        <TextareaField
          label={t('descriptionLabel')}
          placeholder={t('descriptionPlaceholder')}
          error={errors.description}
          registration={register('description')}
        />

        <SubmitButton isLoading={isSubmitting}>
          {editingActivity ? t('save') : t('create')}
        </SubmitButton>
      </ModalForm>
    </Modal>
  );
};
