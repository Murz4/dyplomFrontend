import { useEffect, useState } from 'react';
import { Formik, Form, FieldArray, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { IoCloseOutline } from 'react-icons/io5';
import styles from './participantsModal.module.scss';
import { postAddMembers } from 'src/api/postAddMembers';
import { useAppSelector } from '@common/store/hooks';
import { getRoles } from 'src/api/getRoles';
import { patchChangeRole } from 'src/api/patchChangeRole';
import { deleteUserFromProject } from 'src/api/deleteUserFromProject';

interface Participant {
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
  role: string;
  role_id: number;
}

interface Role {
  id: number;
  name: string;
}

interface ParticipantsModalProps {
  onClosed: () => void;
  participants: Participant[];
  loading?: boolean;
  onRoleUpdated?: () => void;
}

const validationSchema = Yup.object({
  emails: Yup.array()
    .of(Yup.string().email('Invalid email format').required('Email is required'))
    .min(1, 'Add at least one email'),
});

const roleChangeValidationSchema = Yup.object({
  roleId: Yup.number().required('Please select a role'),
});

export const ParticipantsModal = ({
  onClosed,
  participants,
  onRoleUpdated,
  loading = false,
}: ParticipantsModalProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'profile' | 'roleChange' | 'add' | 'deleteConfirm'>('list');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const currentProject = useAppSelector(state => state.projectData.projectId);
  const [roles, setRoles] = useState<Role[]>([]);
  const [deleteError, setDeleteError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      const data = await getRoles();
      setRoles(data);
    };

    fetchRoles();
  }, []);

  const handleParticipantClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setViewMode('profile');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedParticipant(null);
    setDeleteError('');
  };

  const handleBackToProfile = () => {
    setViewMode('profile');
    setDeleteError('');
  };

  const handleOpenRoleChange = () => {
    setViewMode('roleChange');
  };

  const handleShowAddForm = () => {
    setViewMode('add');
  };

  const handleOpenDeleteConfirm = () => {
    setDeleteError('');
    setViewMode('deleteConfirm');
  };

  const handleConfirmDelete = async () => {
    if (!selectedParticipant) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteUserFromProject({
        project_id: currentProject,
        user_id: selectedParticipant.user.id,
      });

      onRoleUpdated?.();
      setTimeout(() => {
        handleBackToList();
      }, 200);
    } catch (error: any) {
      setDeleteError(error?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCurrentRoleId = (): string => selectedParticipant?.role_id?.toString() || '';

  const getCurrentRoleName = (): string => {
    if (!selectedParticipant) {
      return '';
    }

    const role = roles.find(r => r.id === selectedParticipant.role_id);
    return role?.name || selectedParticipant.role || 'Unknown';
  };

  return (
    <div onClick={onClosed} className={styles.container__wrapper}>
      <div onClick={e => e.stopPropagation()} className={styles.container}>
        <button onClick={onClosed} className={styles.container__closeButton} aria-label='Close modal'>
          <IoCloseOutline size={30} color='#333' />
        </button>

        {viewMode === 'add' && (
          <div className={styles.container__addForm}>
            <button className={styles.container__backButton} onClick={handleBackToList} aria-label='Go back'>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M15 18L9 12L15 6'
                  stroke='#2d3748'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>

            <h2 className={styles.container__formTitle}>Add Members</h2>

            <Formik
              initialValues={{ emails: [''] }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                try {
                  const validEmails = values.emails.filter(email => email.trim() !== '');
                  await postAddMembers({
                    project_id: currentProject,
                    members: validEmails,
                  });
                  handleBackToList();
                } catch (error: any) {
                  setStatus(error?.message || 'Failed to add members');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, isSubmitting, status }) => (
                <Form className={styles.container__form}>
                  <FieldArray name='emails'>
                    {({ push, remove }) => (
                      <div className={styles.container__emailsList}>
                        {values.emails.map((_, index) => (
                          <div key={index} className={styles.container__emailItem}>
                            <div className={styles.container__inputWrapper}>
                              <Field
                                name={`emails.${index}`}
                                type='email'
                                placeholder='Enter email address'
                                className={styles.container__input}
                              />
                              {values.emails.length > 1 && (
                                <button
                                  type='button'
                                  onClick={() => remove(index)}
                                  className={styles.container__removeButton}
                                  aria-label='Remove email'
                                >
                                  <IoCloseOutline size={20} />
                                </button>
                              )}
                            </div>
                            <ErrorMessage name={`emails.${index}`}>
                              {msg => <div className={styles.container__error}>{msg}</div>}
                            </ErrorMessage>
                          </div>
                        ))}

                        <button type='button' onClick={() => push('')} className={styles.container__addEmailButton}>
                          + Add another email
                        </button>
                      </div>
                    )}
                  </FieldArray>

                  {status && <div className={styles.container__error}>{status}</div>}

                  <div className={styles.container__formActions}>
                    <button
                      type='button'
                      onClick={handleBackToList}
                      className={styles.container__cancelButton}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button type='submit' className={styles.container__submitButton} disabled={isSubmitting}>
                      {isSubmitting ? 'Adding...' : 'Add Members'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}

        {viewMode === 'list' && (
          <div className={styles.container__participantsView}>
            <div className={styles.container__header}>
              <h2 className={styles.container__title}>Participants</h2>
              <button className={styles.container__addButton} onClick={handleShowAddForm} aria-label='Add participant'>
                +
              </button>
            </div>

            {loading ? (
              <div className={styles.container__loadingState}>
                <div className={styles.container__spinner} />
                <p className={styles.container__loadingText}>Loading participants...</p>
              </div>
            ) : participants.length === 0 ? (
              <p className={styles.container__emptyText}>No participants yet</p>
            ) : (
              <div className={styles.container__participantsList}>
                {participants.map(participant => (
                  <div
                    key={participant.user.id}
                    className={styles.container__participantItem}
                    onClick={() => handleParticipantClick(participant)}
                  >
                    <div className={styles.container__avatar}>
                      <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                        <circle cx='12' cy='12' r='10' fill='#4A5568' />
                        <path
                          d='M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z'
                          fill='white'
                        />
                        <path
                          d='M6 18C6 15.7909 7.79086 14 10 14H14C16.2091 14 18 15.7909 18 18V19H6V18Z'
                          fill='white'
                        />
                      </svg>
                    </div>
                    <span className={styles.container__participantName}>
                      {participant.user.name} {participant.user.surname}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'profile' && selectedParticipant && (
          <div className={styles.container__profileView}>
            <button className={styles.container__backButton} onClick={handleBackToList} aria-label='Go back'>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M15 18L9 12L15 6'
                  stroke='#2d3748'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>

            <button
              className={styles.container__deleteButton}
              onClick={handleOpenDeleteConfirm}
              aria-label='Delete user'
            >
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                <path
                  d='M4 5H16M8 9V15M12 9V15M5 5L6 17C6 17.5304 6.21071 18.0391 6.58579 18.4142C6.96086 18.7893 7.46957 19 8 19H12C12.5304 19 13.0391 18.7893 13.4142 18.4142C13.7893 18.0391 14 17.5304 14 17L15 5M9 5V3C9 2.73478 9.10536 2.48043 9.29289 2.29289C9.48043 2.10536 9.73478 2 10 2C10.2652 2 10.5196 2.10536 10.7071 2.29289C10.8946 2.48043 11 2.73478 11 3V5'
                  stroke='#e53e3e'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>

            <div className={styles.container__profileContent}>
              <div className={styles.container__avatarLarge}>
                <svg width='64' height='64' viewBox='0 0 64 64' fill='none'>
                  <circle cx='32' cy='32' r='32' fill='#2d3748' />
                  <path
                    d='M32 32C36.4183 32 40 28.4183 40 24C40 19.5817 36.4183 16 32 16C27.5817 16 24 19.5817 24 24C24 28.4183 27.5817 32 32 32Z'
                    fill='white'
                  />
                  <path d='M16 48C16 42.4772 20.4772 38 26 38H38C43.5228 38 48 42.4772 48 48V51H16V48Z' fill='white' />
                </svg>
              </div>

              <h2 className={styles.container__name}>
                {selectedParticipant.user.name} {selectedParticipant.user.surname}
              </h2>
              <p className={styles.container__email}>{selectedParticipant.user.email}</p>

              <div onClick={() => handleOpenRoleChange()} className={styles.container__roleBadge}>
                <span className={styles.container__roleText}>{getCurrentRoleName()}</span>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'deleteConfirm' && selectedParticipant && (
          <div className={styles.container__deleteConfirmView}>
            <button className={styles.container__backButton} onClick={handleBackToProfile} aria-label='Go back'>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M15 18L9 12L15 6'
                  stroke='#2d3748'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>

            <div className={styles.container__deleteConfirmContent}>
              <div className={styles.container__deleteIcon}>
                <svg width='48' height='48' viewBox='0 0 48 48' fill='none'>
                  <circle cx='24' cy='24' r='24' fill='#FEE2E2' />
                  <path
                    d='M16 18H32M20 22V30M28 22V30M18 18L19 34C19 34.5304 19.2107 35.0391 19.5858 35.4142C19.9609 35.7893 20.4696 36 21 36H27C27.5304 36 28.0391 35.7893 28.4142 35.4142C28.7893 35.0391 29 34.5304 29 34L30 18M22 18V16C22 15.4696 22.2107 14.9609 22.5858 14.5858C22.9609 14.2107 23.4696 14 24 14C24.5304 14 25.0391 14.2107 25.4142 14.5858C25.7893 14.9609 26 15.4696 26 16V18'
                    stroke='#DC2626'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>

              <h2 className={styles.container__deleteConfirmTitle}>Delete User</h2>
              <p className={styles.container__deleteConfirmText}>
                Are you sure you want to remove{' '}
                <strong>
                  {selectedParticipant.user.name} {selectedParticipant.user.surname}
                </strong>{' '}
                from this project? This action cannot be undone.
              </p>

              {deleteError && <div className={styles.container__error}>{deleteError}</div>}

              <div className={styles.container__deleteConfirmActions}>
                <button
                  type='button'
                  onClick={handleBackToProfile}
                  className={styles.container__cancelButton}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={handleConfirmDelete}
                  className={styles.container__deleteConfirmButton}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'roleChange' && selectedParticipant && (
          <div className={styles.container__roleChangeView}>
            <button
              className={styles.container__roleChangeBackButton}
              onClick={handleBackToProfile}
              aria-label='Go back'
            >
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M15 18L9 12L15 6'
                  stroke='#2d3748'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
            <div className={styles.container__currentRoleInfo}>
              <div className={styles.container__currentRoleLabel}>Current role</div>
              <div className={styles.container__currentRoleBadge}>{getCurrentRoleName()}</div>
            </div>

            <Formik
              initialValues={{ roleId: getCurrentRoleId() }}
              validationSchema={roleChangeValidationSchema}
              enableReinitialize
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                try {
                  await patchChangeRole({
                    project_id: currentProject,
                    user_email: selectedParticipant.user.email,
                    role_id: Number(values.roleId),
                  });

                  setStatus({ success: true, message: 'Role updated successfully' });

                  onRoleUpdated?.();

                  setTimeout(() => {
                    handleBackToList();
                  }, 200);
                } catch (error: any) {
                  setStatus({ success: false, message: error?.message || 'Failed to update role' });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, isSubmitting, status }) => (
                <Form className={styles.container__roleForm}>
                  <div className={styles.container__roleFormGroup}>
                    <div className={styles.container__roleSelect}>
                      {roles.map(role => (
                        <label key={role.id} className={styles.container__roleOption}>
                          <Field
                            type='radio'
                            name='roleId'
                            value={role.id.toString()}
                            className={styles.container__roleRadio}
                          />
                          <span className={styles.container__roleOptionText}>{role.name}</span>
                        </label>
                      ))}
                    </div>

                    <ErrorMessage name='roleId'>
                      {msg => <div className={styles.container__error}>{msg}</div>}
                    </ErrorMessage>
                  </div>

                  {status && (
                    <div className={status.success ? styles.container__success : styles.container__error}>
                      {status.message}
                    </div>
                  )}

                  <button
                    type='submit'
                    className={styles.container__saveRoleButton}
                    disabled={isSubmitting || values.roleId === getCurrentRoleId()}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </div>
  );
};
