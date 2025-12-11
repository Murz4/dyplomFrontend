import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import dinosaurImage from '/dinosaurImage.svg';
import { useState, useEffect } from 'react';
import { Modal } from '@modules/main/Modal/Modal';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import styles from './header.module.scss';
import { StepItem } from '../StepItem/StepItem';
import { DropDown } from '../DropDown/DropDown';
import { CustomInput } from '../CustomInput/CustomInput';
import { getPurposes } from 'src/api/getPurposes';
import { IoAddOutline } from 'react-icons/io5';
import { postProject, ProjectPayload } from 'src/api/postProject';
import { useAppDispatch } from '@common/store/hooks';
import { getProjects } from '@common/store/slicer/getProjectsSlice';

const step1ValidationSchema = Yup.object({
  projectName: Yup.string().min(3, 'Min 3 symbols').max(50, 'Max 50 symbols').required('Project name is required'),
});

const step2ValidationSchema = Yup.object({
  category: Yup.number().required('Select Category'),
});

const step3ValidationSchema = Yup.object({
  participants: Yup.array().of(Yup.string()),
});

const step4ValidationSchema = Yup.object({
  details: Yup.string().max(500, 'Max 500 symbols'),
});

export const Header = () => {
  const [isClosed, setIsClosed] = useState(true);
  const [stepCount, setStepCount] = useState(1);
  const [formData, setFormData] = useState({
    projectName: '',
    category: null as number | null,
    participants: [] as string[],
    details: '',
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [participantEmail, setParticipantEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const totalSteps = 4;

  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await getPurposes();
        setCategories(res);
      } catch (error) {
        setCategories([
          { id: 1, name: 'Education' },
          { id: 2, name: 'Entertainment' },
          { id: 3, name: 'Business' },
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (!isClosed) {
      fetchCategories();
    }
  }, [isClosed]);

  const handleNext = (values: any) => {
    setFormData({ ...formData, ...values });
    if (stepCount < totalSteps) {
      setStepCount(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (stepCount > 1) {
      setStepCount(prev => prev - 1);
    }
  };

  const handleSubmit = async (values: any) => {
    const finalData = { ...formData, ...values };
    const payload: ProjectPayload = {
      name: finalData.projectName,
      purpose_id: finalData.category,
      description: finalData.details,
      users: finalData.participants,
    };
    console.log('Payload for API:', payload);

    try {
      const createdProject = await postProject(payload);
      console.log('add project:', createdProject);
      await dispatch(getProjects({ cursor: 0, limit: 10 }));
      setIsClosed(true);
      setStepCount(1);
      setFormData({ projectName: '', category: null, participants: [], details: '' });
    } catch (error) {
      console.error('error:', error.message);
    }
  };

  const handleClose = () => {
    setIsClosed(true);
    setStepCount(1);
    setFormData({ projectName: '', category: null, participants: [], details: '' });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddParticipant = (setFieldValue: any, participants: string[]) => {
    if (!participantEmail.trim()) {
      setEmailError('Please enter an email');
      return;
    }

    if (!validateEmail(participantEmail)) {
      setEmailError('Please enter a valid email');
      return;
    }

    if (participants.includes(participantEmail)) {
      setEmailError('This email is already added');
      return;
    }

    const updatedParticipants = [...participants, participantEmail];
    setFieldValue('participants', updatedParticipants);
    setFormData({ ...formData, participants: updatedParticipants });
    setParticipantEmail('');
    setEmailError('');
  };

  return (
    <div className={styles.container}>
      <img src={dinosaurImage} alt='Dinosaur' />
      <div className={styles.container__buttons}>
        <div style={{ width: 70 }}>
          <HeaderButton onClick={() => setIsClosed(false)}>Create</HeaderButton>
        </div>
        <div style={{ width: 70 }}>
          <HeaderButton>Join</HeaderButton>
        </div>
      </div>

      {!isClosed && (
        <Modal onClosed={handleClose}>
          <div
            style={{
              display: 'flex',
              gap: 37,
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              width: '100%',
            }}
          >
            {stepCount === 1 && (
              <Formik
                initialValues={{ projectName: formData.projectName }}
                validationSchema={step1ValidationSchema}
                onSubmit={handleNext}
              >
                {() => (
                  <Form
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      width: '100%',
                    }}
                  >
                    <div>
                      <p className={styles.container__modalTitle}>Create your project</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 37 }}>
                        <p className={styles.container__modalLabel}>Name</p>
                        <Field name='projectName'>
                          {({ field }: any) => <CustomInput {...field} placeholder='Enter the project name' />}
                        </Field>
                        <ErrorMessage name='projectName'>
                          {msg => <div style={{ color: 'red', fontSize: 14 }}>{msg}</div>}
                        </ErrorMessage>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 37 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <HeaderButton type='submit' style={{ borderRadius: 15, width: 88, height: 35 }}>
                          Next
                        </HeaderButton>
                      </div>
                      <StepItem currentStep={stepCount} totalSteps={totalSteps} />
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {stepCount === 2 && (
              <Formik
                initialValues={{ category: formData.category }}
                validationSchema={step2ValidationSchema}
                onSubmit={handleNext}
              >
                {({ values, setFieldValue }) => (
                  <Form
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      width: '100%',
                    }}
                  >
                    <div>
                      <p className={styles.container__modalTitle}>Create your project</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 37 }}>
                        <p className={styles.container__modalLabel}>Purpose</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ fontSize: 20, color: 'black' }}>Select the category:</p>
                          <DropDown
                            title={
                              values.category ? categories.find(cat => cat.id === values.category)?.name : 'Category'
                            }
                          >
                            {closeDropdown => (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer' }}>
                                {isLoadingCategories ? (
                                  <p style={{ padding: '8px', color: '#666' }}>Loading...</p>
                                ) : categories.length > 0 ? (
                                  categories.map(cat => (
                                    <p
                                      key={cat.id}
                                      onClick={() => {
                                        setFieldValue('category', cat.id);
                                        closeDropdown();
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        transition: 'background-color 0.2s',
                                      }}
                                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                      {cat.name}
                                    </p>
                                  ))
                                ) : (
                                  <p style={{ padding: '8px', color: '#666' }}>No categories available</p>
                                )}
                              </div>
                            )}
                          </DropDown>
                        </div>
                        <ErrorMessage name='category'>
                          {msg => <div style={{ color: 'red', fontSize: 14 }}>{msg}</div>}
                        </ErrorMessage>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 37 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <HeaderButton
                          type='button'
                          onClick={handleBack}
                          style={{ borderRadius: 15, width: 88, height: 35 }}
                        >
                          Back
                        </HeaderButton>
                        <HeaderButton type='submit' style={{ borderRadius: 15, width: 88, height: 35 }}>
                          Next
                        </HeaderButton>
                      </div>
                      <StepItem currentStep={stepCount} totalSteps={totalSteps} />
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {stepCount === 3 && (
              <Formik
                initialValues={{ participants: formData.participants }}
                validationSchema={step3ValidationSchema}
                onSubmit={handleNext}
              >
                {({ values, setFieldValue }) => (
                  <Form
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      width: '100%',
                    }}
                  >
                    <div>
                      <p className={styles.container__modalTitle}>Create your project</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 37 }}>
                        <p className={styles.container__modalLabel}>Access</p>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div
                            style={{
                              height: 52,
                              paddingRight: 1,
                              paddingLeft: 5,
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: '#C7CFE6',
                              borderRadius: 15,
                            }}
                          >
                            <input
                              type='email'
                              value={participantEmail}
                              onChange={e => {
                                setParticipantEmail(e.target.value);
                                setEmailError('');
                              }}
                              placeholder='Add participants email'
                              style={{
                                width: '100%',
                                fontSize: 15,
                                border: 'none',
                                backgroundColor: 'transparent',
                                outline: 'none',
                              }}
                              onKeyPress={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddParticipant(setFieldValue, values.participants);
                                }
                              }}
                            />
                            <div
                              onClick={() => handleAddParticipant(setFieldValue, values.participants)}
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <IoAddOutline size={30} />
                            </div>
                          </div>
                          <div
                            style={{
                              borderRadius: 15,
                              height: 52,
                              width: '100%',
                              maxWidth: 88,
                              display: 'flex',
                              gap: 12,
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingRight: 17,
                              paddingLeft: 17,
                              backgroundColor: '#C7CFE6',
                            }}
                          >
                            <img style={{ width: 30, height: 30 }} src='/empImg.svg' alt='participants' />
                            <p style={{ fontSize: 20, fontWeight: 600 }}>{values.participants.length}</p>
                          </div>
                        </div>
                        {emailError && <div style={{ color: 'red', fontSize: 14, marginTop: 5 }}>{emailError}</div>}
                        {values.participants.length > 0 && (
                          <div className={styles.container__participantsScroll}>
                            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Added participants:</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              {values.participants.map((email, index) => (
                                <div
                                  key={index}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: 8,
                                  }}
                                >
                                  <span style={{ fontSize: 14 }}>{email}</span>
                                  <button
                                    type='button'
                                    onClick={() => {
                                      const updatedParticipants = values.participants.filter((_, i) => i !== index);
                                      setFieldValue('participants', updatedParticipants);
                                      setFormData({ ...formData, participants: updatedParticipants });
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#ff4444',
                                      cursor: 'pointer',
                                      fontSize: 16,
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 37 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <HeaderButton
                          type='button'
                          onClick={handleBack}
                          style={{ borderRadius: 15, width: 88, height: 35 }}
                        >
                          Back
                        </HeaderButton>
                        <HeaderButton type='submit' style={{ borderRadius: 15, width: 88, height: 35 }}>
                          Next
                        </HeaderButton>
                      </div>
                      <StepItem currentStep={stepCount} totalSteps={totalSteps} />
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {stepCount === 4 && (
              <Formik
                initialValues={{ details: formData.details }}
                validationSchema={step4ValidationSchema}
                onSubmit={handleSubmit}
              >
                {() => (
                  <Form
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      width: '100%',
                    }}
                  >
                    <div>
                      <p className={styles.container__modalTitle}>Create your project</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 37 }}>
                        <p className={styles.container__modalLabel}>Additional options</p>
                        <Field name='details'>
                          {({ field }: any) => <CustomInput label='Add details' placeholder='Add details' {...field} />}
                        </Field>
                        <ErrorMessage name='details'>
                          {msg => <div style={{ color: 'red', fontSize: 14 }}>{msg}</div>}
                        </ErrorMessage>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 37 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <HeaderButton
                          type='button'
                          onClick={handleBack}
                          style={{ borderRadius: 15, width: 88, height: 35 }}
                        >
                          Back
                        </HeaderButton>
                        <HeaderButton type='submit' style={{ borderRadius: 15, width: 88, height: 35 }}>
                          Create
                        </HeaderButton>
                      </div>
                      <StepItem currentStep={stepCount} totalSteps={totalSteps} />
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
