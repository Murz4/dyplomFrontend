import { useEffect, useState } from 'react';
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

interface TaskFormValues {
  selectedProject: string;
  taskName: string;
  startTime: string;
  endTime: string;
  description: string;
  priority: string;
  participants: string;
  isOneDayTask: boolean;
}

const taskValidationSchema = Yup.object({
  selectedProject: Yup.string().required('Project is required'),
  taskName: Yup.string().min(3, 'Task name must be at least 3 characters').required('Task name is required'),
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
  participants: Yup.string(),
  isOneDayTask: Yup.boolean(),
});

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 850);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 850);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmitTask = (values: TaskFormValues) => {
    console.log('Task created:', values);
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const projectOptions = [
    { value: 'project1', label: 'Project 1' },
    { value: 'project2', label: 'Project 2' },
    { value: 'project3', label: 'Project 3' },
  ];

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.container__main}>
        {isMobile === true ? null : (
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
              startTime: '',
              endTime: '',
              description: '',
              priority: '',
              participants: '',
              isOneDayTask: false,
            }}
            validationSchema={taskValidationSchema}
            onSubmit={handleSubmitTask}
            validateOnBlur={false}
            validateOnChange={true}
            validateOnMount={false}
          >
            {({ values }) => (
              <Form>
                <div className={styles.container__modalContent}>
                  <p className={styles.container__modalTitle}>Create your new task</p>

                  <p className={styles.container__label}>* Select the project to add the task to</p>
                  <div style={{ height: 56 }}>
                    <CustomSelect name='selectedProject' options={projectOptions} placeholder='Select Project' />
                  </div>
                  <ErrorMessage name='selectedProject'>
                    {msg => <div className={styles.container__error}>{msg}</div>}
                  </ErrorMessage>

                  <p className={styles.container__labelTop}>* Name your task</p>
                  <Field name='taskName'>
                    {({ field }: any) => (
                      <CustomInput {...field} style={{ height: 56, borderRadius: 15 }} label='Task Name' />
                    )}
                  </Field>
                  <ErrorMessage name='taskName'>
                    {msg => <div className={styles.container__error}>{msg}</div>}
                  </ErrorMessage>

                  <p className={styles.container__labelTop}>* Select a time of the task</p>
                  <div className={styles.container__timeContainer}>
                    <CustomTimePicker name='startTime' placeholder='From' disabled={values.isOneDayTask} />
                    <span className={styles.container__timeSeparator}>—</span>
                    <CustomTimePicker name='endTime' placeholder='To' disabled={values.isOneDayTask} />
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
                    <Field
                      type='checkbox'
                      name='isOneDayTask'
                      id='isOneDayTask'
                      className={styles.container__checkbox}
                    />
                    <label htmlFor='isOneDayTask' className={styles.container__checkboxLabel}>
                      One Day Task
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
                  <div className={styles.container__participantsContainer}>
                    <Field
                      type='text'
                      name='participants'
                      placeholder='Add Participants...'
                      className={styles.container__participantsInput}
                    />
                    <button type='button' className={styles.container__addButton}>
                      +
                    </button>
                  </div>

                  <div className={styles.container__submitButtonContainer}>
                    <HeaderButton type='submit' style={{ height: 70, fontSize: 30, fontWeight: 'bold', maxWidth: 181 }}>
                      Add Task
                    </HeaderButton>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </div>
  );
};
