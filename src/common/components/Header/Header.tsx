import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import dinosaurImage from '/dinosaurImage.svg';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Modal } from '@modules/main/Modal/Modal';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line } from 'react-icons/ri';
import { MdSpaceDashboard, MdHome, MdSettings, MdKeyboardArrowDown } from 'react-icons/md';
import styles from './header.module.scss';
import { StepItem } from '../StepItem/StepItem';
import { DropDown } from '../DropDown/DropDown';
import { CustomInput } from '../CustomInput/CustomInput';
import { getPurposes } from 'src/api/getPurposes';
import { IoAddOutline } from 'react-icons/io5';
import { postProject, ProjectPayload } from 'src/api/postProject';
import { useAppDispatch } from '@common/store/hooks';
import { getProjects } from '@common/store/slicer/getProjectsSlice';
import { getUserName } from 'src/api/getUserName';
import { postJoinByCode } from 'src/api/postJoinByCode';
import { logout } from '@common/store/slicer/userSlice';

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
const joinValidationSchema = Yup.object({
  code: Yup.string().trim().required('Enter the project code'),
});

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isClosed, setIsClosed] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalJoin, setModalJoin] = useState(false);
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
  const [serverError, setServerError] = useState('');
  const [joinError, setJoinError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const totalSteps = 4;
  const dispatch = useAppDispatch();
  const isOnMainPage = location.pathname === '/';
  const isOnCalendar = location.pathname === '/calendar';
  const isOnSettings = location.pathname === '/settings';

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userBlockRef.current && !userBlockRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const [userName, setUserName] = useState<any>('');
  useLayoutEffect(() => {
    const loadUserName = async () => {
      const data = await getUserName();
      setUserName(data);
    };
    loadUserName();
  }, []);

  const handleNext = (values: any) => {
    setFormData({ ...formData, ...values });
    setServerError('');
    if (stepCount < totalSteps) {
      setStepCount(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setServerError('');
    if (stepCount > 1) {
      setStepCount(prev => prev - 1);
    }
  };

  const handleSubmit = async (values: any) => {
    setServerError('');
    const finalData = { ...formData, ...values };
    const payload: ProjectPayload = {
      name: finalData.projectName,
      purpose_id: finalData.category!,
      description: finalData.details,
      users: finalData.participants,
    };
    try {
      await postProject(payload);
      await dispatch(getProjects({ cursor: 0, limit: 10 })).unwrap();
      setIsClosed(true);
      setStepCount(1);
      setFormData({ projectName: '', category: null, participants: [], details: '' });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'An error occurred while creating the project';
      setServerError(errorMessage);
    }
  };

  const handleClose = () => {
    setIsClosed(true);
    setStepCount(1);
    setParticipantEmail('');
    setEmailError('');
    setFormData({ projectName: '', category: null, participants: [], details: '' });
    setServerError('');
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

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.container}>
      <img
        src={dinosaurImage}
        alt='Dinosaur'
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/')}
        className={styles.container__desktopLogo}
      />

      <div className={styles.container__mobileMenu} ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RiMenu3Line size={28} color='#333' />
        </button>

        {isMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '12px',
              backgroundColor: '#EBF3FF',
              borderRadius: '16px',
              padding: '16px',
              minWidth: '200px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!isOnCalendar && (
                <div
                  onClick={() => handleMenuItemClick('/calendar')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#E8E8D0')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <MdSpaceDashboard size={24} color='#333' />
                  <span style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>Calendar</span>
                </div>
              )}
              {!isOnMainPage && (
                <div
                  onClick={() => handleMenuItemClick('/')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#E8E8D0')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <MdHome size={24} color='#333' />
                  <span style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>Home page</span>
                </div>
              )}
              {!isOnSettings && (
                <div
                  onClick={() => handleMenuItemClick('/settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#E8E8D0')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <MdSettings size={24} color='#333' />
                  <span style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>Settings</span>
                </div>
              )}

              <div style={{ height: '1px', backgroundColor: '#ccc', margin: '12px 0' }} />

              <div
                onClick={() => {
                  setIsClosed(false);
                  setIsMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  backgroundColor: '#C5DCFF',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#333',
                }}
              >
                Create project
              </div>

              <div
                onClick={() => {
                  setModalJoin(true);
                  setIsMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  backgroundColor: '#C5DCFF',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#333',
                }}
              >
                Join project
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className={styles.container__buttons}>
          <div style={{ width: 70, height: 30 }}>
            <HeaderButton onClick={() => setIsClosed(false)}>Create</HeaderButton>
          </div>
          <div style={{ width: 70, height: 30 }}>
            <HeaderButton onClick={() => setModalJoin(true)}>Join</HeaderButton>
          </div>
        </div>

        <nav className={styles.container__desktopNav} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!isOnMainPage && (
            <div
              style={{
                height: 30,
                width: 45,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                justifyContent: 'center',
                backgroundColor: '#C5DCFF',
                borderRadius: 5,
              }}
              onClick={() => navigate('/')}
            >
              <MdHome size={25} />
            </div>
          )}
          {!isOnCalendar && (
            <div
              onClick={() => navigate('/calendar')}
              style={{
                height: 30,
                width: 45,
                backgroundColor: '#C5DCFF',
                padding: '3px 10px',
                borderRadius: 5,
                cursor: 'pointer',
              }}
            >
              <img width='100%' height='100%' src='/calendarImage.svg' alt='calendar icon' />
            </div>
          )}
        </nav>

        <div
          ref={userBlockRef}
          className={styles.container__userBlock}
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
        >
          <p style={{ fontSize: 16, fontWeight: 600, color: '#000000' }}>
            {userName.name} {userName.surname}
          </p>

          <MdKeyboardArrowDown
            size={25}
            style={{
              transition: 'transform 0.2s ease',
              transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />

          {isUserDropdownOpen && (
            <div className={styles.container__userDropdown}>
              <button
                className={styles.container__logoutButton}
                onClick={e => {
                  e.stopPropagation();
                  console.log('Logout clicked');
                  logout();
                  setIsUserDropdownOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {!isOnSettings && (
          <div className={styles.container__settingsBlock} onClick={() => navigate('/settings')}>
            <img width={23} height={23} src='/settingIcon.svg' alt='settings icon' />
          </div>
        )}
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
                              padding: '0 5px',
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
                                      const updated = values.participants.filter((_, i) => i !== index);
                                      setFieldValue('participants', updated);
                                      setFormData({ ...formData, participants: updated });
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
                        {serverError && <p style={{ color: 'red', fontSize: 14, marginTop: 10 }}>{serverError}</p>}
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

      {modalJoin && (
        <Modal
          onClosed={() => {
            setModalJoin(false);
            setJoinError('');
          }}
        >
          <Formik
            initialValues={{ code: '' }}
            validationSchema={joinValidationSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              setJoinError('');
              setSubmitting(true);
              try {
                await postJoinByCode(values.code.trim());
                setModalJoin(false);
                resetForm();
                await dispatch(getProjects({ cursor: 0, limit: 10 })).unwrap();
              } catch (error: any) {
                const errorMessage =
                  error.response?.data?.message || error.message || 'An error occurred while creating the project';
                setJoinError(errorMessage);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 30,
                  marginTop: 40,
                  width: '100%',
                  padding: '0 20px',
                }}
              >
                <p style={{ fontSize: 28, fontWeight: 600, textAlign: 'center' }}>Join the project</p>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 20,
                  }}
                >
                  <Field name='code'>
                    {({ field }: any) => (
                      <CustomInput
                        {...field}
                        placeholder='Enter the project code'
                        style={{ height: 56, fontSize: 20, borderRadius: 15 }}
                      />
                    )}
                  </Field>
                  <ErrorMessage name='code'>
                    {msg => <div style={{ color: 'red', fontSize: 14, marginTop: 8, textAlign: 'left' }}>{msg}</div>}
                  </ErrorMessage>
                  <p style={{ fontSize: 20, textDecoration: 'underline', color: 'black' }}>Enter the project code</p>
                </div>
                {joinError && (
                  <p style={{ color: 'red', fontSize: 16, textAlign: 'center', maxWidth: 400 }}>{joinError}</p>
                )}
                <HeaderButton
                  type='submit'
                  disabled={isSubmitting}
                  style={{
                    height: 70,
                    maxWidth: 300,
                    borderRadius: 25,
                    fontSize: 28,
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Joining...' : 'Join the project'}
                </HeaderButton>
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </div>
  );
};
