import ArtBoardTop from '/artBoardTop.png';
import ArtBoardBottom from '/artBoardBottom.png';
import styles from './authPage.module.scss';
import { CustomInput } from '@common/components/CustomInput/CustomInput';
import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import { useLayoutEffect, useState } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { login } from '@common/store/slicer/userSlice';
import { useAppDispatch } from '@common/store/hooks';
import { register } from '@common/store/slicer/registrationSlice';
import { useNavigate } from 'react-router';

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegistrationFormValues {
  name: string;
  surname: string;
  email: string;
  password: string;
}

interface IAuthPageProps {
  mode: 'login' | 'reg' | 'verify';
}

const loginValidationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must contain at least 6 characters').required('Password is required'),
});

const registrationValidationSchema = Yup.object({
  name: Yup.string().min(2, 'Name must contain at least 2 characters').required('Name is required'),
  surname: Yup.string().min(2, 'Surname must contain at least 2 characters').required('Surname is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must contain at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one digit')
    .required('Password is required'),
});

export const AuthPage = ({ mode }: IAuthPageProps) => {
  const [formState, setFormState] = useState<'login' | 'reg' | 'verify'>(mode);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    setFormState(mode);
    console.log(mode);
  }, [mode]);

  const loginInitialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  const registrationInitialValues: RegistrationFormValues = {
    name: '',
    surname: '',
    email: '',
    password: '',
  };

  const handleLoginSubmit = async (values: LoginFormValues, { setSubmitting }: FormikHelpers<LoginFormValues>) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      await dispatch(login(values)).unwrap();

      console.log('Login values:', values);
      setSuccessMessage('You have successfully logged in!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error?.message || 'An error occurred during login');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegistrationSubmit = async (
    values: RegistrationFormValues,
    { setSubmitting }: FormikHelpers<RegistrationFormValues>
  ) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      const full_name: string = `${values.name}${values.surname}`;

      await dispatch(register({ full_name: full_name, email: values.email, password: values.password }));

      console.log('Registration values:', values);
      setSuccessMessage('Registration successful!');
      navigate('/verify');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error?.message || 'An error occurred during registration');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <img className={styles.container__artTop} src={ArtBoardTop} alt='Decorative art board top' />
      <img className={styles.container__artBottom} src={ArtBoardBottom} alt='Decorative art board bottom' />

      {formState === 'login' ? (
        <div className={styles.container__main}>
          <Formik
            initialValues={loginInitialValues}
            validationSchema={loginValidationSchema}
            onSubmit={handleLoginSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className={styles.container__mainContent}>
                <div className={styles.container__inputsContainer}>
                  <div>
                    <CustomInput
                      label='Email'
                      placeholder='Email'
                      name='email'
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.email && touched.email && <p className={styles.container__errorText}>{errors.email}</p>}
                  </div>

                  <div>
                    <CustomInput
                      label='Password'
                      placeholder='Password'
                      name='password'
                      type='password'
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.password && touched.password && (
                      <p className={styles.container__errorText}>{errors.password}</p>
                    )}
                  </div>

                  <p className={styles.container__forgotPassword}>Forgot your password?</p>
                </div>

                {successMessage && <div className={styles.container__successMessage}>{successMessage}</div>}

                {errorMessage && <div className={styles.container__errorMessage}>{errorMessage}</div>}

                <div className={styles.container__buttonsWrapper}>
                  <div className={styles.container__loginButton}>
                    <HeaderButton type='submit' disabled={isSubmitting} style={{ fontSize: '24px' }}>
                      {isSubmitting ? 'Loading...' : 'Log In'}
                    </HeaderButton>
                  </div>
                  <p className={styles.container__divider}>or</p>
                  <div className={styles.container__signupButton}>
                    <HeaderButton type='button' onClick={() => navigate('/reg')} style={{ fontSize: '24px' }}>
                      Sign Up
                    </HeaderButton>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      ) : formState === 'reg' ? (
        <div className={styles.container__main}>
          <Formik
            initialValues={registrationInitialValues}
            validationSchema={registrationValidationSchema}
            onSubmit={handleRegistrationSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className={styles.container__mainRegContent}>
                <p className={styles.container__registrationTitle}>Register Your Account</p>

                <div className={styles.container__registrationUpperInputs}>
                  <div style={{ flex: 1 }}>
                    <CustomInput
                      label='Name'
                      name='name'
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.name && touched.name && <p className={styles.container__errorText}>{errors.name}</p>}
                  </div>

                  <div style={{ flex: 1 }}>
                    <CustomInput
                      label='Surname'
                      name='surname'
                      value={values.surname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.surname && touched.surname && (
                      <p className={styles.container__errorText}>{errors.surname}</p>
                    )}
                  </div>
                </div>

                <div>
                  <CustomInput
                    label='E-mail'
                    name='email'
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.email && touched.email && <p className={styles.container__errorText}>{errors.email}</p>}
                </div>

                <div>
                  <CustomInput
                    label='Password'
                    name='password'
                    type='password'
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.password && touched.password && (
                    <p className={styles.container__errorText}>{errors.password}</p>
                  )}
                </div>

                {successMessage && <div className={styles.container__successMessage}>{successMessage}</div>}

                {errorMessage && <div className={styles.container__errorMessage}>{errorMessage}</div>}

                <div className={styles.container__regButton}>
                  <HeaderButton type='submit' disabled={isSubmitting} style={{ fontSize: '24px', borderRadius: 25 }}>
                    {isSubmitting ? 'Loading...' : 'Registration'}
                  </HeaderButton>
                </div>

                <p className={styles.container__switchForm} onClick={() => navigate('/login')}>
                  Already have an account? Log In
                </p>
              </Form>
            )}
          </Formik>
        </div>
      ) : formState === 'verify' ? (
        <div className={styles.container__main}>
          <div className={styles.container__verifyMain}>
            <div className={styles.container__verifyTextWrapper}>
              <p className={styles.container__verifyTitle}>Verify Your Email</p>
              <p className={styles.container__verifyText}>
                We’ve sent you a message with a verification link. Please check your inbox or spam folder and follow the
                link to proceed.
              </p>
            </div>
            <img style={{ marginRight: 10 }} src='/public/verifyImage.svg' />
          </div>
        </div>
      ) : (
        <div className={styles.container__main}>
          <div className={styles.container__verifyMain}>
            <div className={styles.container__verifyTextWrapper}>
              <p className={styles.container__verifyTitle}>Email Verified</p>
              <p className={styles.container__verifyText}>
                Your email address has been successfully verified. You can now continue using your account without any
                restrictions.
              </p>
            </div>
            <img style={{ marginRight: 10 }} src='/public/verifySuccessImage.svg' />
          </div>
        </div>
      )}
    </div>
  );
};
