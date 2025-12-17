import ArtBoardTop from '/artBoardTop.png';
import ArtBoardBottom from '/artBoardBottom.png';
import styles from './authPage.module.scss';
import { CustomInput } from '@common/components/CustomInput/CustomInput';
import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { login } from '@common/store/slicer/userSlice';
import { useAppDispatch } from '@common/store/hooks';
import { register } from '@common/store/slicer/registrationSlice';
import { useNavigate, useSearchParams } from 'react-router';
import apiClient from 'src/api/instances';
import { forgotPassword } from '@common/store/slicer/forgotPasswordSlice';

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

interface ChangePasswordFormValues {
  email: string;
}

interface NewPasswordFormValues {
  password: string;
  confirmPassword: string;
}

interface IAuthPageProps {
  mode: 'login' | 'reg' | 'verify' | 'verified-email' | 'change-password' | 'create-new-password' | 'password-changed';
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

const changePasswordValidationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
});

const newPasswordValidationSchema = Yup.object({
  password: Yup.string()
    .min(6, 'Password must contain at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one digit')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const AuthPage = ({ mode }: IAuthPageProps) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  const [formState, setFormState] = useState<
    'login' | 'reg' | 'verify' | 'verified-email' | 'change-password' | 'create-new-password' | 'password-changed'
  >(mode);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    setFormState(mode);
    console.log(mode);
  }, [mode]);

  useEffect(() => {
    console.log('token:', token);

    if (formState !== 'verified-email') {
      return;
    }

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await apiClient.get('/user/activate', {
          params: { token },
        });

        console.log('response:', response.data);
        setIsVerified(!!response.data);
      } catch (error) {
        setIsVerified(false);
      }
    };

    verifyEmail();
  }, [formState, token, navigate]);

  useEffect(() => {
    if (formState !== 'create-new-password') {
      return;
    }

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const validateResetToken = async () => {
      try {
        const response = await apiClient.get('/user/reset_password', {
          params: { token },
        });

        console.log('Token validation response:', response.data);
        setIsTokenValid(!!response.data);
      } catch (error) {
        console.error('Token validation error:', error);
        setIsTokenValid(false);
      }
    };

    validateResetToken();
  }, [formState, token, navigate]);

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

  const changePasswordInitialValues: ChangePasswordFormValues = {
    email: '',
  };

  const newPasswordInitialValues: NewPasswordFormValues = {
    password: '',
    confirmPassword: '',
  };

  const handleLoginSubmit = async (values: LoginFormValues, { setSubmitting }: FormikHelpers<LoginFormValues>) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      await dispatch(login(values)).unwrap();

      console.log('Login values:', values);
      setSuccessMessage('You have successfully logged in!');
      setTimeout(() => {
        navigate('/');
      }, 1000);
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

      await dispatch(register({ full_name: full_name, email: values.email, password: values.password })).unwrap();

      console.log('Registration values:', values);
      setSuccessMessage('Registration successful!');

      navigate('/verify');
    } catch (error: any) {
      setErrorMessage(error?.message || 'An error occurred during login');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePasswordSubmit = async (
    values: ChangePasswordFormValues,
    { setSubmitting }: FormikHelpers<ChangePasswordFormValues>
  ) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      await dispatch(forgotPassword(values.email)).unwrap();

      console.log('Password reset request:', values);
      setSuccessMessage('Password reset instructions have been sent to your email!');

      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (error: any) {
      setErrorMessage(error?.message || 'An error occurred while sending reset instructions');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewPasswordSubmit = async (
    values: NewPasswordFormValues,
    { setSubmitting }: FormikHelpers<NewPasswordFormValues>
  ) => {
    console.log('password', values.password);
    console.log('password', token);

    try {
      setErrorMessage('');

      const response = await apiClient.post('/user/reset-password-by-token', {
        token: token,
        password: values.password,
      });

      console.log('Password reset response:', response.data);
      if (response.data) {
        setSuccessMessage('Password has been changed');
        setTimeout(() => {
          navigate('/login');
        }, 500);
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'An error occurred while resetting password');
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

                  <p onClick={() => navigate('/change-password')} className={styles.container__forgotPassword}>
                    Forgot your password?
                  </p>
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

                <p
                  style={{ maxWidth: 'fit-content', alignSelf: 'center' }}
                  className={styles.container__switchForm}
                  onClick={() => navigate('/login')}
                >
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
                We've sent you a message with a verification link. Please check your inbox or spam folder and follow the
                link to proceed.
              </p>
            </div>
            <img style={{ marginRight: 10 }} src='/verifyImage.svg' alt='verify image' />
          </div>
        </div>
      ) : formState === 'change-password' ? (
        <div className={styles.container__main}>
          <Formik
            initialValues={changePasswordInitialValues}
            validationSchema={changePasswordValidationSchema}
            onSubmit={handleChangePasswordSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className={styles.container__verifyMain}>
                <div className={styles.container__verifyTextWrapper}>
                  <p className={styles.container__verifyTitle}>Enter Your Email</p>
                  <p className={styles.container__verifyText}>
                    If you've forgotten your password, enter your email and we'll send you reset instructions. Follow
                    the link in the email to set a new password.
                  </p>
                </div>

                <div style={{ width: '100%' }}>
                  <CustomInput
                    label='E-mail'
                    name='email'
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.email && touched.email && <p className={styles.container__errorText}>{errors.email}</p>}
                </div>

                {successMessage && <div className={styles.container__successMessage}>{successMessage}</div>}

                {errorMessage && <div className={styles.container__errorMessage}>{errorMessage}</div>}

                <HeaderButton
                  type='submit'
                  disabled={isSubmitting}
                  style={{ height: 56, borderRadius: 25, maxWidth: 204, fontSize: 28, fontWeight: 'bold' }}
                >
                  {isSubmitting ? 'Sending...' : 'Send'}
                </HeaderButton>

                <p className={styles.container__forgotPassword} onClick={() => navigate('/login')}>
                  Back to login
                </p>
              </Form>
            )}
          </Formik>
        </div>
      ) : formState === 'create-new-password' ? (
        <div className={styles.container__main}>
          <div className={styles.container__verifyMain}>
            {isTokenValid === null && <p className={styles.container__verifyText}>Validating reset link...</p>}

            {isTokenValid === true && (
              <Formik
                initialValues={newPasswordInitialValues}
                validationSchema={newPasswordValidationSchema}
                onSubmit={handleNewPasswordSubmit}
              >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                  <Form style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className={styles.container__verifyTextWrapper}>
                      <p className={styles.container__verifyTitle}>Create a New Password</p>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                        paddingTop: 20,
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        <CustomInput
                          label='New Password'
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

                      <div style={{ width: '100%' }}>
                        <CustomInput
                          label='Confirm Password'
                          name='confirmPassword'
                          type='password'
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {successMessage && (
                          <div style={{ marginTop: 10 }} className={styles.container__successMessage}>
                            {successMessage}
                          </div>
                        )}
                        {errors.confirmPassword && touched.confirmPassword && (
                          <p className={styles.container__errorText}>{errors.confirmPassword}</p>
                        )}
                      </div>

                      {errorMessage && <div className={styles.container__errorMessage}>{errorMessage}</div>}

                      <HeaderButton
                        type='submit'
                        disabled={isSubmitting}
                        style={{
                          height: 79,
                          marginTop: 20,
                          maxWidth: 326,
                          fontSize: 28,
                          fontWeight: 'bold',
                          borderRadius: 25,
                        }}
                      >
                        {isSubmitting ? 'Saving...' : 'Confirm Changes'}
                      </HeaderButton>
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {isTokenValid === false && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={styles.container__verifyTextWrapper}>
                  <p className={styles.container__verifyTitle}>Invalid Reset Link ❌</p>
                  <p className={styles.container__verifyText}>The password reset link is invalid or has expired</p>
                </div>
                <HeaderButton
                  onClick={() => navigate('/login', { replace: true })}
                  style={{
                    height: 79,
                    marginTop: 41,
                    maxWidth: 326,
                    fontSize: 28,
                    fontWeight: 'bold',
                    borderRadius: 25,
                  }}
                >
                  Back
                </HeaderButton>
              </div>
            )}
          </div>
        </div>
      ) : formState === 'password-changed' ? (
        <div className={styles.container__main}>
          <div className={styles.container__verifyMain}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.container__verifyTextWrapper}>
                <p className={styles.container__verifyTitle}>Password Changed ✅</p>
                <p className={styles.container__verifyText}>Your password has been successfully updated!</p>
              </div>
              <HeaderButton
                onClick={() => navigate('/login', { replace: true })}
                style={{
                  height: 79,
                  marginTop: 41,
                  maxWidth: 326,
                  fontSize: 28,
                  fontWeight: 'bold',
                  borderRadius: 25,
                }}
              >
                Back to Login
              </HeaderButton>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.container__main}>
          <div className={styles.container__verifyMain}>
            {isVerified === null && <p className={styles.container__verifyText}>Checking verification...</p>}

            {isVerified === true && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={styles.container__verifyTextWrapper}>
                  <p className={styles.container__verifyTitle}>Email Verified ✅</p>
                  <p className={styles.container__verifyText}>Your email address has been successfully verified.</p>
                </div>
                <img src='/verifySuccessImage.svg' alt='verify success image' />
                <HeaderButton
                  onClick={() => navigate('/login', { replace: true })}
                  style={{
                    height: 79,
                    marginTop: 41,
                    maxWidth: 326,
                    fontSize: 28,
                    fontWeight: 'bold',
                    borderRadius: 25,
                  }}
                >
                  Back to login
                </HeaderButton>
              </div>
            )}

            {isVerified === false && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={styles.container__verifyTextWrapper}>
                  <p className={styles.container__verifyTitle}>Verification Failed ❌</p>
                  <p className={styles.container__verifyText}>The verification link is invalid or expired.</p>
                </div>
                <HeaderButton
                  onClick={() => navigate('/reg', { replace: true })}
                  style={{
                    height: 79,
                    marginTop: 41,
                    maxWidth: 326,
                    fontSize: 28,
                    fontWeight: 'bold',
                    borderRadius: 25,
                  }}
                >
                  Back to registration
                </HeaderButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
