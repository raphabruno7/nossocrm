import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import type { Company } from '@/types';
import { Modal, ModalForm } from '@/components/ui/Modal';
import { InputField, SubmitButton } from '@/components/ui/FormField';
import { companyFormSchema } from '@/lib/validations/schemas';
import type { CompanyFormData } from '@/lib/validations/schemas';

type CompanyFormInput = z.input<typeof companyFormSchema>;

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => void;
  editingCompany: Company | null;
}

/**
 * Componente React `CompanyFormModal`.
 *
 * @param {CompanyFormModalProps} {
  isOpen,
  onClose,
  onSubmit,
  editingCompany,
} - Parâmetro `{
  isOpen,
  onClose,
  onSubmit,
  editingCompany,
}`.
 * @returns {Element} Retorna um valor do tipo `Element`.
 */
export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCompany,
}) => {
  const t = useTranslations('contacts.companyForm');
  const form = useForm<CompanyFormInput>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: editingCompany?.name || '',
      industry: editingCompany?.industry || '',
      website: editingCompany?.website || '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: editingCompany?.name || '',
        industry: editingCompany?.industry || '',
        website: editingCompany?.website || '',
      });
    }
  }, [isOpen, editingCompany, reset]);

  const handleFormSubmit = (data: CompanyFormInput) => {
    const parsed = companyFormSchema.parse(data);
    onSubmit(parsed);
    onClose();
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCompany ? t('editTitle') : t('createTitle')}
    >
      <ModalForm onSubmit={handleSubmit(handleFormSubmit)}>
        <InputField
          label={t('name')}
          placeholder={t('namePlaceholder')}
          required
          error={errors.name}
          registration={register('name')}
        />

        <InputField
          label={t('industry')}
          placeholder={t('industryPlaceholder')}
          error={errors.industry}
          registration={register('industry')}
        />

        <InputField
          label={t('website')}
          placeholder={t('websitePlaceholder')}
          hint={t('websiteHint')}
          error={errors.website}
          registration={register('website')}
        />

        <SubmitButton isLoading={isSubmitting}>
          {editingCompany ? t('save') : t('create')}
        </SubmitButton>
      </ModalForm>
    </Modal>
  );
};
