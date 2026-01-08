import { useEffect, useState, useRef } from 'react';
import styles from './calendarPage.module.scss';
import { Calendar } from '@modules/CalendarPage/Calendar/Calendar';
import { SmallCalendar } from '@modules/SmallCalendar/SmallCalendar';
import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import { IoAddOutline } from 'react-icons/io5';
import { Modal } from '@modules/main/Modal/Modal';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { CustomInput } from '@common/components/CustomInput/CustomInput';
import { CustomSelect } from '@common/components/CustomSelect/CustomSelect';
import { CustomTimePicker } from '@common/components/CustomTimePicker/CustomTimePicker';
import { CustomDatePicker } from '@common/components/CustomDatePicker/CustomDatePicker';
import { useAppDispatch, useAppSelector } from '@common/store/hooks';
import { getProjects } from '@common/store/slicer/getProjectsSlice';
import { getProjectMembers } from 'src/api/getProjectMembers';
import { postTask } from 'src/api/postTask';
import { addNewTask, fetchTasks } from '@common/store/slicer/getTasksSlice';

interface ProjectMember {
  role_id: number;
  role: string;
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
}

interface TaskFormValues {
  selectedProject: string;
  taskName: string;
  taskDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description: string;
  priority: string;
  participants: string[];
  isOneDayTask: boolean;
  isMultiDayTask: boolean;
}

const taskValidationSchema = Yup.object({
  selectedProject: Yup.string().required('Project is required'),
  taskName: Yup.string().min(3, 'Task name must be at least 3 characters').required('Task name is required'),
  taskDate: Yup.string().required('Start date is required'),
  endDate: Yup.string().when('isMultiDayTask', {
    is: true,
    then: schema =>
      schema.test('is-after-start', 'End date must be on or after start date', function (value) {
        const { taskDate } = this.parent;
        if (!value) {
          return true;
        }
        return taskDate && value >= taskDate;
      }),
    otherwise: schema => schema.notRequired(),
  }),
  startTime: Yup.string().when('isOneDayTask', {
    is: false,
    then: schema => schema.required('Start time is required'),
    otherwise: schema => schema,
  }),
  endTime: Yup.string().when('isOneDayTask', {
    is: false,
    then: schema => schema.required('End time is required'),
    otherwise: schema => schema,
  }),
  description: Yup.string(),
  priority: Yup.string().required('Priority is required'),
  participants: Yup.array().of(Yup.string()),
  isOneDayTask: Yup.boolean(),
  isMultiDayTask: Yup.boolean(),
});

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 850);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const projectsState = useAppSelector(state => state.projects);
  const activeProjects = projectsState.items.filter(p => !p.is_archived);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreProjects = async () => {
    if (isLoadingMore || !projectsState.hasMore || !projectsState.nextCursor) {
      return;
    }
    setIsLoadingMore(true);
    try {
      await dispatch(getProjects({ cursor: projectsState.nextCursor, limit: 10 })).unwrap();
    } catch (err) {
      console.error('Failed to load more projects:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && activeProjects.length === 0 && !projectsState.loading) {
      dispatch(getProjects({ limit: 10 }));
    }
  }, [isModalOpen, dispatch, activeProjects.length, projectsState.loading]);

  useEffect(() => {
    if (!observerTarget.current || !projectsState.hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !projectsState.loading && !isLoadingMore && projectsState.nextCursor) {
          loadMoreProjects();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [projectsState.hasMore, projectsState.loading, projectsState.nextCursor, isLoadingMore]);

  const projectOptions = activeProjects.map(project => ({
    value: String(project.id),
    label: project.name,
  }));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadProjectMembers = async (projectId: number) => {
    setLoadingMembers(true);
    try {
      const members = await getProjectMembers(projectId);
      setProjectMembers(members);
    } catch (error) {
      console.error('Failed to load project members:', error);
      setProjectMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    if (projectId) {
      loadProjectMembers(Number(projectId));
    } else {
      setProjectMembers([]);
    }
  };

  const handleRemoveParticipant = (email: string, currentParticipants: string[], setFieldValue: any) => {
    setFieldValue(
      'participants',
      currentParticipants.filter(p => p !== email)
    );
  };

  const handleSubmitTask = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    setTaskError(null);

    try {
      const userIds = values.participants
        .map(email => {
          const member = projectMembers.find(m => m.user.email === email);
          return member?.user.email;
        })
        .filter((id): id is number => id !== undefined);

      const startDateTime = values.isOneDayTask
        ? `${values.taskDate}T00:00:00.000Z`
        : `${values.taskDate}T${values.startTime}:00.000Z`;

      let deadlineDateTime = '';
      if (values.isMultiDayTask && values.endDate) {
        deadlineDateTime = values.isOneDayTask
          ? `${values.endDate}T23:59:59.999Z`
          : `${values.endDate}T${values.endTime}:00.000Z`;
      } else {
        deadlineDateTime = values.isOneDayTask
          ? `${values.taskDate}T23:59:59.999Z`
          : `${values.taskDate}T${values.endTime}:00.000Z`;
      }

      const payload = {
        project_id: Number(values.selectedProject),
        name: values.taskName,
        priority_id: Number(values.priority),
        description: values.description || '',
        start_date: values.taskDate,
        start_time: values.isOneDayTask ? null : `${values.startTime}:00.000Z`,
        deadline_date: values.isMultiDayTask && values.endDate ? values.endDate : values.taskDate,
        deadline_time: values.isOneDayTask ? null : `${values.endTime}:00.000Z`,
        users: userIds,
        without_time: Boolean(values.isOneDayTask),
      };

      await postTask(payload);

      const optimisticTask = {
        task_id: Date.now(),
        project_id: Number(values.selectedProject),
        name: values.taskName,
        description: values.description || '',
        priority_id: Number(values.priority),
        start_at: startDateTime,
        deadline_at: deadlineDateTime,
        is_overdue: false,
        is_completed: false,
      };

      dispatch(addNewTask(optimisticTask));

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      dispatch(fetchTasks({ year, month }));

      setIsModalOpen(false);
      setProjectMembers([]);
      setTaskError(null);
    } catch (error: any) {
      console.error('Failed to create task:', error);
      console.log('Error response data:', error.response?.data);

      let errorMessage = 'Failed to create task. Please try again.';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
        } else if (typeof detail === 'object' && detail.msg) {
          errorMessage = detail.msg;
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else {
          errorMessage = JSON.stringify(detail);
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(', ');
        } else {
          const firstError = Object.values(errors)[0];
          if (typeof firstError === 'string') {
            errorMessage = firstError;
          } else if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else {
            errorMessage = JSON.stringify(firstError);
          }
        }
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }

      setTaskError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setProjectMembers([]);
    setTaskError(null);
  };

  const priorityOptions = [
    { value: '1', label: 'Urgent' },
    { value: '2', label: 'High' },
    { value: '3', label: 'Normal' },
    { value: '4', label: 'Low' },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={styles.container}>
      <div className={styles.container__main}>
        {isMobile ? null : (
          <div className={styles.container__smallCalendar}>
            <HeaderButton onClick={() => setIsModalOpen(true)} style={{ height: 51, maxWidth: 166 }}>
              <div className={styles.container__addTaskButton}>
                <p>Add Task</p>
                <IoAddOutline size={34} color='white' />
              </div>
            </HeaderButton>
            <SmallCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
          </div>
        )}
        <Calendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
      </div>

      {isModalOpen && (
        <Modal onClosed={handleClose}>
          <Formik
            initialValues={{
              selectedProject: '',
              taskName: '',
              taskDate: '',
              endDate: '',
              startTime: '',
              endTime: '',
              description: '',
              priority: '',
              participants: [],
              isOneDayTask: false,
              isMultiDayTask: false,
            }}
            validationSchema={taskValidationSchema}
            onSubmit={handleSubmitTask}
            validateOnBlur={false}
            validateOnChange={true}
            validateOnMount={false}
          >
            {({ values, setFieldValue }) => {
              const [isParticipantDropdownOpen, setIsParticipantDropdownOpen] = useState(false);
              const [selectedMemberEmail, setSelectedMemberEmail] = useState('');

              useEffect(() => {
                if (values.selectedProject) {
                  handleProjectChange(values.selectedProject);
                  setFieldValue('participants', []);
                  setSelectedMemberEmail('');
                } else {
                  setProjectMembers([]);
                  setSelectedMemberEmail('');
                }
              }, [values.selectedProject]);

              useEffect(() => {
                if (!isParticipantDropdownOpen) {
                  return;
                }

                const handleClickOutside = (e: MouseEvent) => {
                  if (!(e.target as HTMLElement).closest(`.${styles.container__participantsInputContainer}`)) {
                    setIsParticipantDropdownOpen(false);
                  }
                };

                document.addEventListener('mousedown', handleClickOutside);
                return () => document.removeEventListener('mousedown', handleClickOutside);
              }, [isParticipantDropdownOpen]);

              return (
                <Form>
                  <div className={styles.container__modalContent}>
                    <p className={styles.container__modalTitle}>Create your new task</p>

                    {taskError && (
                      <div
                        className={styles.container__error}
                        style={{
                          padding: '12px',
                          backgroundColor: '#ffebee',
                          borderRadius: '8px',
                          border: '1px solid #ef5350',
                          marginBottom: '10px',
                        }}
                      >
                        {taskError}
                      </div>
                    )}

                    <p className={styles.container__label}>* Select the project to add the task to</p>
                    <div style={{ height: 56 }}>
                      <CustomSelect
                        name='selectedProject'
                        options={projectOptions}
                        placeholder='Select Project'
                        isLoading={projectsState.loading && activeProjects.length === 0}
                      />
                    </div>
                    <ErrorMessage name='selectedProject'>
                      {msg => <div className={styles.container__error}>{msg}</div>}
                    </ErrorMessage>

                    {projectsState.hasMore && (
                      <div
                        ref={observerTarget}
                        style={{
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666',
                          fontSize: '14px',
                          margin: '10px 0',
                        }}
                      >
                        {isLoadingMore && 'Loading more projects...'}
                      </div>
                    )}

                    <p className={styles.container__labelTop}>* Name your task</p>
                    <Field name='taskName'>
                      {({ field }: any) => (
                        <CustomInput {...field} style={{ height: 56, borderRadius: 15 }} label='Task Name' />
                      )}
                    </Field>
                    <ErrorMessage name='taskName'>
                      {msg => <div className={styles.container__error}>{msg}</div>}
                    </ErrorMessage>

                    <p className={styles.container__labelTop}>* Select the start date of the task</p>
                    <div className={styles.container__dateWrapper}>
                      <CustomDatePicker
                        value={values.taskDate}
                        onChange={date => {
                          setFieldValue('taskDate', date);
                          if (values.isMultiDayTask && values.endDate && date > values.endDate) {
                            setFieldValue('endDate', '');
                          }
                        }}
                        minDate={today}
                      />
                      <div className={styles.container__calendarIcon}>📅</div>
                    </div>
                    <ErrorMessage name='taskDate'>
                      {msg => <div className={styles.container__error}>{msg}</div>}
                    </ErrorMessage>

                    <div className={styles.container__checkboxContainer}>
                      <Field
                        type='checkbox'
                        name='isMultiDayTask'
                        id='isMultiDayTask'
                        className={styles.container__checkbox}
                      />
                      <label htmlFor='isMultiDayTask' className={styles.container__checkboxLabel}>
                        Task spans multiple days
                      </label>
                    </div>

                    {values.isMultiDayTask && (
                      <>
                        <p className={styles.container__labelTop}>Select the end date (optional)</p>
                        <div className={styles.container__dateWrapper}>
                          <CustomDatePicker
                            value={values.endDate}
                            onChange={date => setFieldValue('endDate', date)}
                            minDate={values.taskDate ? new Date(values.taskDate) : today}
                          />
                          <div className={styles.container__calendarIcon}>📅</div>
                        </div>
                        <ErrorMessage name='endDate'>
                          {msg => <div className={styles.container__error}>{msg}</div>}
                        </ErrorMessage>
                      </>
                    )}

                    <p className={styles.container__labelTop}>* Select a time of the task</p>
                    <div className={styles.container__timeContainer}>
                      <CustomTimePicker
                        name='startTime'
                        placeholder='From'
                        disabled={values.isOneDayTask}
                        maxTime={values.endTime || undefined}
                      />
                      <span className={styles.container__timeSeparator}>—</span>
                      <CustomTimePicker
                        name='endTime'
                        placeholder='To'
                        disabled={values.isOneDayTask}
                        minTime={values.startTime || undefined}
                      />
                    </div>

                    {!values.isOneDayTask && (
                      <>
                        <ErrorMessage name='startTime'>
                          {msg => <div className={styles.container__errorSmall}>{msg}</div>}
                        </ErrorMessage>
                        <ErrorMessage name='endTime'>
                          {msg => <div className={styles.container__errorMedium}>{msg}</div>}
                        </ErrorMessage>
                      </>
                    )}

                    <div className={styles.container__checkboxContainer}>
                      <Field name='isOneDayTask'>
                        {({ field, form }: any) => (
                          <input
                            type='checkbox'
                            id='isOneDayTask'
                            className={styles.container__checkbox}
                            checked={!!field.value}
                            onChange={e => {
                              const newValue = e.target.checked;
                              form.setFieldValue('isOneDayTask', newValue);

                              if (newValue) {
                                form.setFieldValue('startTime', '');
                                form.setFieldValue('endTime', '');
                              }
                            }}
                          />
                        )}
                      </Field>
                      <label htmlFor='isOneDayTask' className={styles.container__checkboxLabel}>
                        Without Time Task
                      </label>
                    </div>

                    <p className={styles.container__label}>Add a description to the task</p>
                    <Field name='description'>
                      {({ field }: any) => (
                        <CustomInput
                          {...field}
                          style={{ height: 56, borderRadius: 15 }}
                          label='Description and comments'
                        />
                      )}
                    </Field>

                    <p className={styles.container__label}>* Select the priority of the task</p>
                    <div style={{ height: 56 }}>
                      <CustomSelect name='priority' options={priorityOptions} placeholder='Select Priority' />
                    </div>
                    <ErrorMessage name='priority'>
                      {msg => <div className={styles.container__error}>{msg}</div>}
                    </ErrorMessage>

                    <p className={styles.container__labelTop}>Add participants to the task</p>
                    <div className={styles.container__participantsSection}>
                      <div className={styles.container__participantsInputContainer}>
                        <div
                          className={styles.container__participantsTrigger}
                          onClick={() => {
                            if (!values.selectedProject || loadingMembers || projectMembers.length === 0) {
                              return;
                            }
                            setIsParticipantDropdownOpen(!isParticipantDropdownOpen);
                          }}
                          data-disabled={!values.selectedProject || loadingMembers || projectMembers.length === 0}
                        >
                          <span
                            className={
                              selectedMemberEmail
                                ? styles.container__participantsTriggerText
                                : styles.container__participantsTriggerPlaceholder
                            }
                          >
                            {selectedMemberEmail
                              ? (() => {
                                  const member = projectMembers.find(m => m.user.email === selectedMemberEmail);
                                  return member ? `${member.user.name} ${member.user.surname}` : selectedMemberEmail;
                                })()
                              : loadingMembers
                                ? 'Loading members...'
                                : !values.selectedProject
                                  ? 'Select a project first'
                                  : projectMembers.length === 0
                                    ? 'No members available'
                                    : 'Select participant'}
                          </span>
                          <span style={{ fontSize: '18px', pointerEvents: 'none' }}>▼</span>
                        </div>

                        {isParticipantDropdownOpen && (
                          <div className={styles.container__participantsDropdown}>
                            {projectMembers.length > 0 ? (
                              projectMembers.map(member => (
                                <div
                                  key={member.user.id}
                                  className={styles.container__participantsDropdownItem}
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
                              <div className={styles.container__participantsDropdownEmpty}>No members available</div>
                            )}
                          </div>
                        )}

                        <button
                          type='button'
                          onClick={() => {
                            if (selectedMemberEmail && !values.participants.includes(selectedMemberEmail)) {
                              setFieldValue('participants', [...values.participants, selectedMemberEmail]);
                              setSelectedMemberEmail('');
                            }
                          }}
                          className={styles.container__addButton}
                          disabled={!selectedMemberEmail}
                        >
                          +
                        </button>
                      </div>

                      {values.participants.length > 0 && (
                        <div className={styles.container__participantsList}>
                          {values.participants.map(email => {
                            const member = projectMembers.find(m => m.user.email === email);
                            return (
                              <div key={email} className={styles.container__participantChip}>
                                <span className={styles.container__participantName}>
                                  {member ? `${member.user.name} ${member.user.surname}` : email}
                                </span>
                                <button
                                  type='button'
                                  onClick={() => handleRemoveParticipant(email, values.participants, setFieldValue)}
                                  className={styles.container__removeButton}
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className={styles.container__submitButtonContainer}>
                      <HeaderButton
                        type='submit'
                        style={{ height: 70, fontSize: 30, fontWeight: 'bold', maxWidth: 181 }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Creating...' : 'Add Task'}
                      </HeaderButton>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </Modal>
      )}
    </div>
  );
};
