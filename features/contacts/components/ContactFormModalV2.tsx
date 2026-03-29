import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Contact } from '@/types';
import { Modal, ModalForm } from '@/components/ui/Modal';
import { InputField, SubmitButton } from '@/components/ui/FormField';
import { contactFormSchema } from '@/lib/validations/schemas';
import type { ContactFormData } from '@/lib/validations/schemas';

type ContactFormInput = z.input<typeof contactFormSchema>;

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => void;
  editingContact: Contact | null;
  defaultCompanyName?: string;
}

/**
 * Componente React `ContactFormModalV2`.
 *
 * @param {ContactFormModalProps} {
  isOpen,
  onClose,
  onSubmit,
  editingContact,
  defaultCompanyName = '',
} - Parâmetro `{
  isOpen,
  onClose,
  onSubmit,
  editingContact,
  defaultCompanyName = '',
}`.
 * @returns {Element} Retorna um valor do tipo `Element`.
 */
export const ContactFormModalV2: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingContact,
  defaultCompanyName = '',
}) => {
  const t = useTranslations('contacts.contactForm');
  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: editingContact?.name || '',
      email: editingContact?.email || '',
      phone: editingContact?.phone || '',
      role: editingContact?.role || '',
      companyName: defaultCompanyName,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  // Reset form when modal opens with different contact
  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: editingContact?.name || '',
        email: editingContact?.email || '',
        phone: editingContact?.phone || '',
        role: editingContact?.role || '',
        companyName: defaultCompanyName,
      });
    }
  }, [isOpen, editingContact, defaultCompanyName, reset]);

  const handleFormSubmit = (data: ContactFormInput) => {
    const parsed = contactFormSchema.parse(data);
    onSubmit(parsed);
    onClose();
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingContact ? t('editTitle') : t('createTitle')}
    >
      <ModalForm onSubmit={handleSubmit(handleFormSubmit)}>
        <InputField
          label={t('fullName')}
          placeholder={t('fullNamePlaceholder')}
          error={errors.name}
          registration={register('name')}
        />

        <InputField
          label={t('email')}
          type="email"
          placeholder={t('emailPlaceholder')}
          error={errors.email}
          registration={register('email')}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label={t('phone')}
            placeholder={t('phonePlaceholder')}
            hint={t('phoneHint')}
            error={errors.phone}
            registration={register('phone')}
          />
          <InputField
            label={t('role')}
            placeholder={t('rolePlaceholder')}
            error={errors.role}
            registration={register('role')}
          />
        </div>

        <InputField
          label={t('company')}
          placeholder={t('companyPlaceholder')}
          hint={
            editingContact
              ? t('companyHintEdit')
              : t('companyHintCreate')
          }
          error={errors.companyName}
          registration={register('companyName')}
        />

        <SubmitButton isLoading={isSubmitting}>
          {editingContact ? t('save') : t('create')}
        </SubmitButton>
      </ModalForm>
    </Modal>
  );
};
