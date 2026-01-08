import React, { useEffect, useRef, useState } from 'react';
import styles from './taskModalStyles.module.scss';
import { clearCache, deleteTask } from '@common/store/slicer/getTasksSlice';
import { deleteTaskFromProject } from 'src/api/deleteTaskFromProject';
import { useAppDispatch } from '@common/store/hooks';
import { fetchTasks } from '@common/store/slicer/getTasksSlice';
import { getProjectMembers } from 'src/api/getProjectMembers';

import { CustomDatePicker } from '@common/components/CustomDatePicker/CustomDatePicker';
import { CustomTimePicker } from '@common/components/CustomTimePicker/CustomTimePicker';
import { CustomSelect } from '@common/components/CustomSelect/CustomSelect';

import { Formik, Form, Field } from 'formik';
import { patchTaskUpdate } from 'src/api/patchTaskUpdate';
import { deleteUserFromTask } from 'src/api/deleteUserFromTask';
import { postAddUserToTask } from 'src/api/postAddUserToTask';
import { patchCompleteTask } from 'src/api/patchCompleteTask';

interface Priority {
  id: number;
  name: string;
}

interface Member {
  id?: string;
  users: {
    name: string;
    surname: string;
    email: string;
  };
  role: string;
}

interface Task {
  id?: string;
  name: string;
  priority_name: string;
  creator: {
    name: string;
    surname: string;
  };
  description: string | null;
  is_completed: boolean;
  members: Member[];
  start_at: string;
  deadline_at: string;
  project_id: number;
  project_name: string;
  without_time: boolean;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  loading?: boolean;
  error?: string | null;
  apiEndpoint?: string;
}

interface AvailableUser {
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
  role: string;
  role_id: number;
}

interface IUpdateTaskPayload {
  name?: string;
  description?: string | null;
  priority_id?: number;
  start_at?: string;
  deadline_at?: string;
  without_time?: boolean;
}

const PRIORITIES: Priority[] = [
  { id: 1, name: 'Urgent' },
  { id: 2, name: 'High' },
  { id: 3, name: 'Normal' },
  { id: 4, name: 'Low' },
];

export const TaskModal: React.FC<TaskModalProps & { currentDate: Date }> = ({
  isOpen,
  onClose,
  task: initialTask,
  loading,
  error,
  apiEndpoint = '/api',
  currentDate,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [task, setTask] = useState<Task | null>(initialTask);
  const [localTask, setLocalTask] = useState<Task | null>(initialTask);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMemberMode, setIsAddMemberMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionLoadingComplete, setActionLoadingComplete] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>('');
  const [isParticipantDropdownOpen, setIsParticipantDropdownOpen] = useState(false);
  const [addedParticipants, setAddedParticipants] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [originalValues, setOriginalValues] = useState<any>(null);
  const dispatch = useAppDispatch();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [isActivateConfirmOpen, setIsActivateConfirmOpen] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState<{
    email: string;
    name: string;
    surname: string;
  } | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    setTask(initialTask);
    setLocalTask(initialTask);
  }, [initialTask]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (memberToRemove) {
            setMemberToRemove(null);
          } else if (isDeleteConfirmOpen) {
            setIsDeleteConfirmOpen(false);
          } else if (isCompleteConfirmOpen) {
            setIsCompleteConfirmOpen(false);
          } else if (isActivateConfirmOpen) {
            setIsActivateConfirmOpen(false);
          } else if (isEditMode) {
            setIsEditMode(false);
          } else if (isAddMemberMode) {
            setIsAddMemberMode(false);
          } else {
            onClose();
          }
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
    setIsEditMode(false);
    setIsAddMemberMode(false);
    setIsDeleteConfirmOpen(false);
    setIsCompleteConfirmOpen(false);
    setIsActivateConfirmOpen(false);
    setMemberToRemove(null);
    setLocalError(null);
    setOriginalValues(null);
    setLocalTask(initialTask);
  }, [isOpen, onClose, initialTask]);

  useEffect(() => {
    if (!isParticipantDropdownOpen) {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(`.${styles['task-modal__participants-input-container']}`)) {
        setIsParticipantDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isParticipantDropdownOpen]);

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) {
      return { date: '—', time: '—' };
    }
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const dateStr = `${day}.${month}.${year}`;
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    return { date: dateStr, time: timeStr };
  };

  const displayTask = localTask || task;
  const start = displayTask ? formatDateTime(displayTask.start_at) : { date: '—', time: '—' };
  const end = displayTask ? formatDateTime(displayTask.deadline_at) : { date: '—', time: '—' };

  const getFormikInitialValues = () => {
    if (!task) {
      return {
        name: '',
        priority_id: '',
        description: '',
        taskDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        isOneDayTask: false,
        isMultiDayTask: false,
      };
    }

    const taskDate = task.start_at.split('T')[0];
    const endDate =
      task.start_at.split('T')[0] !== task.deadline_at.split('T')[0] ? task.deadline_at.split('T')[0] : '';

    const startTime = !task.without_time ? task.start_at.slice(11, 16) : '';
    const endTime = !task.without_time ? task.deadline_at.slice(11, 16) : '';

    const currentPriority = PRIORITIES.find(p => p.name === task.priority_name);
    const priority_id = currentPriority ? currentPriority.id.toString() : '';

    const isMultiDayTask = endDate !== '' && !task.without_time;

    return {
      name: task.name,
      priority_id,
      description: task.description || '',
      taskDate,
      endDate,
      startTime,
      endTime,
      isOneDayTask: task.without_time,
      isMultiDayTask,
    };
  };

  const handleToggleComplete = async (archive: boolean) => {
    if (!task?.id) {
      return;
    }
    setActionLoadingComplete(true);
    setLocalError(null);

    try {
      const updatedTask = await patchCompleteTask({ task_id: Number(task.id), archive });
      setTask(updatedTask);
      setLocalTask(updatedTask);

      dispatch(clearCache());
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      dispatch(fetchTasks({ year, month }));
      onClose();
    } catch (err: any) {
      console.error('Error toggling task completion:', err);
      setLocalError(err.message || 'Invalid load status tasks');
    } finally {
      setActionLoadingComplete(false);
      setIsCompleteConfirmOpen(false);
      setIsActivateConfirmOpen(false);
    }
  };

  const handleDeleteClick = () => setIsDeleteConfirmOpen(true);

  const handleConfirmDelete = async () => {
    if (!task?.id) {
      return;
    }
    const taskId = Number(task.id);

    setActionLoading(true);
    setLocalError(null);
    setIsDeleteConfirmOpen(false);

    dispatch(deleteTask(taskId));

    try {
      await deleteTaskFromProject({ task_id: taskId });
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      dispatch(fetchTasks({ year, month }));
    } catch (err: any) {
      console.error('Delete error:', err);
      setLocalError(err.message || 'Failed to delete task');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      dispatch(fetchTasks({ year, month }));
    } finally {
      setActionLoading(false);
      onClose();
    }
  };

  const handleCancelDelete = () => setIsDeleteConfirmOpen(false);

  const handleEditClick = () => {
    setIsAddMemberMode(false);
    setIsEditMode(true);
    setLocalError(null);
    const initial = getFormikInitialValues();
    setOriginalValues(initial);
    setLocalTask(task);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setLocalError(null);
    setOriginalValues(null);
    setLocalTask(task);
  };

  const handleSaveEdit = async (values: any) => {
    if (!task?.id || !originalValues) {
      setLocalError('Task data missing');
      return;
    }

    let newStartAt = '';
    let newDeadlineAt = '';

    if (values.isOneDayTask) {
      newStartAt = `${values.taskDate}T00:00:00.000Z`;
      if (values.isMultiDayTask && values.endDate) {
        newDeadlineAt = `${values.endDate}T00:00:00.000Z`;
      } else {
        newDeadlineAt = newStartAt;
      }
    } else {
      const startTime = values.startTime || '00:00';
      const endTime = values.endTime || '23:59';
      newStartAt = `${values.taskDate}T${startTime}:00.000Z`;
      newDeadlineAt =
        values.isMultiDayTask && values.endDate
          ? `${values.endDate}T${endTime}:00.000Z`
          : `${values.taskDate}T${endTime}:00.000Z`;
    }

    const payload: IUpdateTaskPayload = {};

    if (values.name.trim() !== originalValues.name) {
      payload.name = values.name.trim();
    }

    const newDesc = values.description?.trim() || null;
    if (newDesc !== originalValues.description) {
      payload.description = newDesc;
    }

    if (Number(values.priority_id) !== Number(originalValues.priority_id)) {
      payload.priority_id = Number(values.priority_id);
    }

    const dateTimeChanged =
      values.taskDate !== originalValues.taskDate ||
      values.endDate !== originalValues.endDate ||
      values.startTime !== originalValues.startTime ||
      values.endTime !== originalValues.endTime ||
      values.isOneDayTask !== originalValues.isOneDayTask ||
      values.isMultiDayTask !== originalValues.isMultiDayTask;

    if (dateTimeChanged) {
      payload.start_at = newStartAt;
      payload.deadline_at = newDeadlineAt;
      payload.without_time = values.isOneDayTask;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditMode(false);
      return;
    }

    setActionLoading(true);
    setLocalError(null);

    try {
      const updatedTask = await patchTaskUpdate({ task_id: task.id!, payload });
      setTask(updatedTask);
      setLocalTask(updatedTask);
      setIsEditMode(false);
      dispatch(clearCache());
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      dispatch(fetchTasks({ year, month }));
      onClose();
    } catch (err: any) {
      console.error('Update error:', err);
      setLocalError(err.message || 'Failed to save changes.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMemberClick = async () => {
    setIsEditMode(false);
    setIsAddMemberMode(true);
    setLocalError(null);
    setSelectedMemberEmail('');
    setAddedParticipants([]);
    try {
      const response = await getProjectMembers(task?.project_id!);
      setAvailableUsers(response);
    } catch (err) {
      console.error(err);
      setLocalError('Failed to load available users.');
    }
  };

  const handleCancelAddMember = () => {
    setIsAddMemberMode(false);
    setLocalError(null);
    setSelectedMemberEmail('');
    setAddedParticipants([]);
  };

  const handleSaveAddMember = async () => {
    if (!task?.id || addedParticipants.length === 0) {
      setLocalError('Please add at least one participant');
      return;
    }

    setActionLoading(true);
    setLocalError(null);

    try {
      await postAddUserToTask({
        task_id: Number(task.id),
        user_emails: addedParticipants,
      });

      const newMembers: Member[] = addedParticipants.map(email => {
        const availableUser = availableUsers.find(u => u.user.email === email);
        return {
          users: {
            name:
              availableUser?.user.name ||
              email
                .split('@')[0]
                .split('.')[0]
                ?.replace(/^\w/, c => c.toUpperCase()) ||
              'Unknown',
            surname:
              availableUser?.user.surname ||
              email
                .split('@')[0]
                .split('.')[1]
                ?.replace(/^\w/, c => c.toUpperCase()) ||
              '',
            email,
          },
          role: availableUser?.role || 'Member',
        };
      });

      const updatedTask = { ...task, members: [...task.members, ...newMembers] };
      setTask(updatedTask);
      setLocalTask(updatedTask);

      setIsAddMemberMode(false);
      setAddedParticipants([]);
      setSelectedMemberEmail('');
    } catch (err: any) {
      console.error('Add members error:', err);
      setLocalError(err.message || 'Failed to add participants');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveParticipant = (email: string) => {
    setAddedParticipants(prev => prev.filter(p => p !== email));
  };

  const handleRemoveMemberClick = (email: string, name: string, surname: string) => {
    setMemberToRemove({ email, name, surname });
  };

  const handleConfirmRemoveMember = async () => {
    if (!task?.id || !memberToRemove) {
      return;
    }

    setActionLoading(true);
    setLocalError(null);

    try {
      await deleteUserFromTask({
        task_id: Number(task.id),
        user_emails: [memberToRemove.email],
      });

      const updatedTask = {
        ...task,
        members: task.members.filter(m => m.users.email !== memberToRemove.email),
      };

      setTask(updatedTask);
      setLocalTask(updatedTask);
    } catch (err: any) {
      console.error(err);
      setLocalError(err.message || 'Invalid delete member');
    } finally {
      setActionLoading(false);
      setMemberToRemove(null);
    }
  };

  const handleCancelRemoveMember = () => {
    setMemberToRemove(null);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles['task-modal-overlay']}
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
    >
      <div ref={modalRef} className={styles['task-modal']} onClick={e => e.stopPropagation()}>
        <button
          ref={closeButtonRef}
          className={styles['task-modal__close']}
          onClick={onClose}
          aria-label='Close modal'
          disabled={actionLoading}
        >
          ×
        </button>

        {loading && (
          <div className={styles['task-modal__loading']} role='status'>
            <p>Loading...</p>
          </div>
        )}

        {(error || localError) && (
          <div className={styles['task-modal__error']} role='alert'>
            <p>{error || localError}</p>
          </div>
        )}

        {displayTask && !loading && (
          <>
            {isEditMode ? (
              <>
                <h2 className={styles['task-modal__title']}>Edit Task</h2>

                <Formik initialValues={getFormikInitialValues()} enableReinitialize onSubmit={handleSaveEdit}>
                  {({ values, setFieldValue }) => (
                    <Form className={styles['task-modal__edit-form']}>
                      <div className={styles['task-modal__form-group']}>
                        <label>Task Name: *</label>
                        <Field
                          name='name'
                          as='input'
                          className={styles['task-modal__input']}
                          disabled={actionLoading}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFieldValue('name', e.target.value);
                            setLocalTask(prev => (prev ? { ...prev, name: e.target.value } : null));
                          }}
                        />
                      </div>

                      <div className={styles['task-modal__form-group']}>
                        <label>Priority: *</label>
                        <div style={{ height: 56 }}>
                          <CustomSelect
                            variant='white'
                            name='priority_id'
                            //@ts-ignore
                            value={values.priority_id}
                            options={PRIORITIES.map(p => ({
                              value: p.id.toString(),
                              label: p.name,
                            }))}
                            placeholder='Select Priority'
                            onChange={(value: string) => {
                              setFieldValue('priority_id', value);
                              const newPriorityName = PRIORITIES.find(p => p.id.toString() === value)?.name || 'Normal';
                              setLocalTask(prev => {
                                if (!prev) {
                                  return prev;
                                }
                                return { ...prev, priority_name: newPriorityName };
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className={styles['task-modal__form-group']}>
                        <label>Start Date: *</label>
                        <div className={styles['task-modal__date-wrapper']}>
                          <CustomDatePicker
                            variant='white'
                            value={values.taskDate}
                            onChange={date => {
                              setFieldValue('taskDate', date);
                              if (values.isMultiDayTask && values.endDate && date > values.endDate) {
                                setFieldValue('endDate', '');
                              }
                            }}
                            minDate={today}
                          />
                          <div className={styles['task-modal__calendar-icon']}>📅</div>
                        </div>
                      </div>

                      <div className={styles['task-modal__checkbox-container']}>
                        <Field
                          type='checkbox'
                          name='isMultiDayTask'
                          id='isMultiDayTask'
                          className={styles['task-modal__checkbox']}
                        />
                        <label htmlFor='isMultiDayTask' className={styles['task-modal__checkbox-label']}>
                          Task spans multiple days
                        </label>
                      </div>

                      {values.isMultiDayTask && (
                        <div className={styles['task-modal__form-group']}>
                          <label>End Date:</label>
                          <div className={styles['task-modal__date-wrapper']}>
                            <CustomDatePicker
                              variant='white'
                              value={values.endDate}
                              onChange={date => setFieldValue('endDate', date)}
                              minDate={values.taskDate ? new Date(values.taskDate) : today}
                            />
                            <div className={styles['task-modal__calendar-icon']}>📅</div>
                          </div>
                        </div>
                      )}

                      <div className={styles['task-modal__form-group']}>
                        <label>Time:</label>
                        <div className={styles['task-modal__time-container']}>
                          <CustomTimePicker
                            variant='white'
                            name='startTime'
                            placeholder='From'
                            disabled={values.isOneDayTask}
                            maxTime={values.endTime}
                          />
                          <span className={styles['task-modal__time-separator']}>—</span>
                          <CustomTimePicker
                            variant='white'
                            name='endTime'
                            placeholder='To'
                            disabled={values.isOneDayTask}
                            minTime={values.startTime}
                          />
                        </div>
                      </div>

                      <div className={styles['task-modal__checkbox-container']}>
                        <Field name='isOneDayTask'>
                          {({ field }: any) => (
                            <input
                              type='checkbox'
                              id='isOneDayTask'
                              className={styles['task-modal__checkbox']}
                              checked={field.value}
                              onChange={e => {
                                const checked = e.target.checked;
                                setFieldValue('isOneDayTask', checked);
                                if (checked) {
                                  setFieldValue('startTime', '');
                                  setFieldValue('endTime', '');
                                }
                                setLocalTask(prev => (prev ? { ...prev, without_time: checked } : null));
                              }}
                            />
                          )}
                        </Field>
                        <label htmlFor='isOneDayTask' className={styles['task-modal__checkbox-label']}>
                          Without Time Task
                        </label>
                      </div>

                      <div className={styles['task-modal__form-group']}>
                        <label>Description:</label>
                        <Field
                          name='description'
                          as='textarea'
                          rows={4}
                          className={styles['task-modal__textarea']}
                          disabled={actionLoading}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setFieldValue('description', e.target.value);
                            setLocalTask(prev => (prev ? { ...prev, description: e.target.value || null } : null));
                          }}
                        />
                      </div>

                      <div className={styles['task-modal__edit-actions']}>
                        <button type='submit' className={styles['task-modal__save']} disabled={actionLoading}>
                          {actionLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type='button'
                          className={styles['task-modal__cancel']}
                          onClick={handleCancelEdit}
                          disabled={actionLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </>
            ) : isAddMemberMode ? (
              <>
                <h2 className={styles['task-modal__title']}>Add Participants</h2>

                <div className={styles['task-modal__edit-form']}>
                  <p className={styles['task-modal__label-top']}>Add participants to the task</p>
                  <div className={styles['task-modal__participants-section']}>
                    <div className={styles['task-modal__participants-input-container']}>
                      <div
                        className={styles['task-modal__participants-trigger']}
                        onClick={() => {
                          if (availableUsers.length === 0 || actionLoading) {
                            return;
                          }
                          setIsParticipantDropdownOpen(!isParticipantDropdownOpen);
                        }}
                        data-disabled={availableUsers.length === 0 || actionLoading}
                      >
                        <span
                          className={
                            selectedMemberEmail
                              ? styles['task-modal__participants-trigger-text']
                              : styles['task-modal__participants-trigger-placeholder']
                          }
                        >
                          {selectedMemberEmail
                            ? (() => {
                                const member = availableUsers.find(m => m.user.email === selectedMemberEmail);
                                return member ? `${member.user.name} ${member.user.surname}` : selectedMemberEmail;
                              })()
                            : availableUsers.length === 0
                              ? 'No members available'
                              : 'Select participant'}
                        </span>
                        <span style={{ fontSize: '18px', pointerEvents: 'none' }}>▼</span>
                      </div>

                      {isParticipantDropdownOpen && (
                        <div className={styles['task-modal__participants-dropdown']}>
                          {availableUsers.length > 0 ? (
                            availableUsers.map(member => (
                              <div
                                key={member.user.id}
                                className={styles['task-modal__participants-dropdown-item']}
                                onClick={() => {
                                  setSelectedMemberEmail(member.user.email);
                                  setIsParticipantDropdownOpen(false);
                                }}
                              >
                                <span>
                                  {member.user.name} {member.user.surname}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className={styles['task-modal__participants-dropdown-empty']}>
                              No members available
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type='button'
                        onClick={() => {
                          if (selectedMemberEmail && !addedParticipants.includes(selectedMemberEmail)) {
                            setAddedParticipants([...addedParticipants, selectedMemberEmail]);
                            setSelectedMemberEmail('');
                          }
                        }}
                        className={styles['task-modal__add-button']}
                        disabled={!selectedMemberEmail}
                      >
                        +
                      </button>
                    </div>

                    {addedParticipants.length > 0 && (
                      <div className={styles['task-modal__participants-list']}>
                        {addedParticipants.map(email => {
                          const member = availableUsers.find(m => m.user.email === email);
                          return (
                            <div key={email} className={styles['task-modal__participant-chip']}>
                              <span className={styles['task-modal__participant-name']}>
                                {member ? `${member.user.name} ${member.user.surname}` : email}
                              </span>
                              <button
                                type='button'
                                onClick={() => handleRemoveParticipant(email)}
                                className={styles['task-modal__remove-button']}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles['task-modal__edit-actions']}>
                    <button
                      className={styles['task-modal__save']}
                      onClick={handleSaveAddMember}
                      disabled={actionLoading || addedParticipants.length === 0}
                    >
                      {actionLoading ? 'Adding...' : 'Add Participants'}
                    </button>
                    <button
                      className={styles['task-modal__cancel']}
                      onClick={handleCancelAddMember}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 id='modal-title' className={styles['task-modal__title']}>
                  {displayTask.name}
                </h2>

                <div className={styles['task-modal__info']}>
                  <div className={styles['task-modal__info-row']}>
                    <strong>Project Name:</strong> <span>{displayTask.project_name}</span>
                  </div>
                  <div className={styles['task-modal__info-row']}>
                    <strong>Priority:</strong> <span>{displayTask.priority_name}</span>
                  </div>
                  <div className={styles['task-modal__info-row']}>
                    <strong>Creator:</strong>{' '}
                    <span>
                      {displayTask.creator.name} {displayTask.creator.surname}
                    </span>
                  </div>
                  <div className={styles['task-modal__info-row']}>
                    <strong>Description:</strong> <span>{displayTask.description || '—'}</span>
                  </div>

                  <div className={styles['task-modal__info-row']}>
                    <strong>Start Date:</strong> <span>{start.date}</span>
                  </div>
                  {displayTask.without_time === false ? (
                    <div className={styles['task-modal__info-row']}>
                      <strong>Start Time:</strong> <span className={styles['task-time']}>{start.time}</span>
                    </div>
                  ) : (
                    <div className={styles['task-modal__info-row']}>
                      <strong>Start Time:</strong> <span className={styles['task-time']}>—</span>
                    </div>
                  )}

                  <div className={styles['task-modal__info-row']}>
                    <strong>End Date:</strong> <span>{end.date}</span>
                  </div>
                  {displayTask.without_time === false ? (
                    <div className={styles['task-modal__info-row']}>
                      <strong>End Time:</strong> <span className={styles['task-time']}>{end.time}</span>
                    </div>
                  ) : (
                    <div className={styles['task-modal__info-row']}>
                      <strong>End Time:</strong> <span className={styles['task-time']}>—</span>
                    </div>
                  )}

                  <div className={styles['task-modal__info-row']}>
                    <strong>Status:</strong>
                    <span
                      className={
                        displayTask.is_completed
                          ? styles['task-modal__status--completed']
                          : styles['task-modal__status--in-progress']
                      }
                    >
                      {displayTask.is_completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>

                {task?.is_completed ? (
                  <button
                    className={styles['task-modal__complete']}
                    onClick={() => setIsActivateConfirmOpen(true)}
                    disabled={actionLoading}
                  >
                    {actionLoadingComplete ? 'Processing...' : 'Activate Task'}
                  </button>
                ) : (
                  <>
                    <div className={styles['task-modal__members']}>
                      <h3>Participants:</h3>
                      {displayTask.members.length > 0 ? (
                        <ul className={styles['task-modal__members-list']}>
                          {displayTask.members.map((member, idx) => {
                            const memberFullName = `${member.users.name} ${member.users.surname}`;

                            return (
                              <li key={`${member.users.email}-${idx}`} className={styles['task-modal__member-item']}>
                                <div className={styles['task-modal__member-info']}>
                                  {memberFullName}
                                  <span className={styles['task-modal__member-role']}>({member.role})</span>
                                </div>

                                <button
                                  className={styles['task-modal__member-remove']}
                                  onClick={() =>
                                    handleRemoveMemberClick(member.users.email, member.users.name, member.users.surname)
                                  }
                                  disabled={actionLoading}
                                >
                                  Remove
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className={styles['task-modal__no-members']}>No participants yet</p>
                      )}
                      <button
                        className={styles['task-modal__member-add']}
                        onClick={handleAddMemberClick}
                        disabled={actionLoading}
                      >
                        + Add Participant
                      </button>
                    </div>

                    <div className={styles['task-modal__actions']}>
                      {!displayTask.is_completed && (
                        <button
                          className={styles['task-modal__complete']}
                          onClick={() => setIsCompleteConfirmOpen(true)}
                          disabled={actionLoading}
                        >
                          {actionLoadingComplete ? 'Processing...' : 'Complete Task'}
                        </button>
                      )}
                      <button className={styles['task-modal__edit']} onClick={handleEditClick} disabled={actionLoading}>
                        Edit Task
                      </button>
                      <button
                        className={styles['task-modal__delete']}
                        onClick={handleDeleteClick}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Deleting...' : 'Delete Task'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {isDeleteConfirmOpen && (
          <div className={styles['task-modal__confirm-overlay']} onClick={handleCancelDelete}>
            <div className={styles['task-modal__confirm-dialog']} onClick={e => e.stopPropagation()}>
              <h3 className={styles['task-modal__confirm-title']}>Delete Task?</h3>
              <p className={styles['task-modal__confirm-text']}>
                Are you sure you want to delete the task <strong>"{displayTask?.name}"</strong>? This action cannot be
                undone.
              </p>
              <div className={styles['task-modal__confirm-actions']}>
                <button
                  className={styles['task-modal__confirm-cancel']}
                  onClick={handleCancelDelete}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className={styles['task-modal__confirm-delete']}
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  autoFocus
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isCompleteConfirmOpen && (
          <div className={styles['task-modal__confirm-overlay']} onClick={() => setIsCompleteConfirmOpen(false)}>
            <div className={styles['task-modal__confirm-dialog']} onClick={e => e.stopPropagation()}>
              <h3 className={styles['task-modal__confirm-title']}>Complete Task?</h3>
              <p className={styles['task-modal__confirm-text']}>
                Mark <strong>"{displayTask?.name}"</strong> as completed?
              </p>
              <div className={styles['task-modal__confirm-actions']}>
                <button
                  className={styles['task-modal__confirm-cancel']}
                  onClick={() => setIsCompleteConfirmOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className={styles['task-modal__confirm-complete']}
                  onClick={() => handleToggleComplete(true)}
                  disabled={actionLoading}
                >
                  {actionLoadingComplete ? 'Completing...' : 'Complete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isActivateConfirmOpen && (
          <div className={styles['task-modal__confirm-overlay']} onClick={() => setIsActivateConfirmOpen(false)}>
            <div className={styles['task-modal__confirm-dialog']} onClick={e => e.stopPropagation()}>
              <h3 className={styles['task-modal__confirm-title']}>Activate Task?</h3>
              <p className={styles['task-modal__confirm-text']}>
                Return <strong>"{displayTask?.name}"</strong> to active status?
              </p>
              <div className={styles['task-modal__confirm-actions']}>
                <button
                  className={styles['task-modal__confirm-cancel']}
                  onClick={() => setIsActivateConfirmOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className={styles['task-modal__confirm-complete']}
                  onClick={() => handleToggleComplete(false)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Activating...' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {memberToRemove && (
          <div className={styles['task-modal__member-confirm-overlay']} onClick={handleCancelRemoveMember}>
            <div className={styles['task-modal__member-confirm-dialog']} onClick={e => e.stopPropagation()}>
              <h3 className={styles['task-modal__member-confirm-title']}>Remove Participant?</h3>
              <p className={styles['task-modal__member-confirm-text']}>
                Remove{' '}
                <strong>
                  {memberToRemove.name} {memberToRemove.surname}
                </strong>{' '}
                from this task?
              </p>
              <div className={styles['task-modal__member-confirm-actions']}>
                <button
                  className={styles['task-modal__member-confirm-cancel']}
                  onClick={handleCancelRemoveMember}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className={styles['task-modal__member-confirm-remove']}
                  onClick={handleConfirmRemoveMember}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
