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

const step1ValidationSchema = Yup.object({
  projectName: Yup.string().min(3, 'Min 3 symbols').max(50, 'Max 50 symbols').required('Project name is required'),
});

const step2ValidationSchema = Yup.object({
  category: Yup.string().required('Select Category'),
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
    category: '',
    participants: [] as string[],
    details: '',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await getPurposes();
        const categoryNames = res.map((item: { id: number; name: string }) => item.name);
        setCategories(categoryNames);
      } catch (error) {
        console.error('error:', error);
        setCategories(['Education', 'Entertainment', 'Business']);
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

  const handleSubmit = (values: any) => {
    const finalData = { ...formData, ...values };
    console.log('FinalData:', finalData);
    setIsClosed(true);
    setStepCount(1);
    setFormData({ projectName: '', category: '', participants: [], details: '' });
  };

  const handleClose = () => {
    setIsClosed(true);
    setStepCount(1);
    setFormData({ projectName: '', category: '', participants: [], details: '' });
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
                          <DropDown title={values.category || 'category'}>
                            {closeDropdown => (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer' }}>
                                {isLoadingCategories ? (
                                  <p style={{ padding: '8px', color: '#666' }}>Loading...</p>
                                ) : categories.length > 0 ? (
                                  categories.map(category => (
                                    <p
                                      key={category}
                                      onClick={() => {
                                        setFieldValue('category', category);
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
                                      {category}
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
                {({ values }) => (
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
                        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                          <div
                            style={{
                              height: 52,
                              paddingRight: 17,
                              paddingLeft: 18,
                              display: 'flex',
                              gap: 20,
                              alignItems: 'center',
                              backgroundColor: '#C7CFE6',
                              borderRadius: 15,
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              console.log('Add participants clicked');
                            }}
                          >
                            <p style={{ fontSize: 17 }}>Add participants</p>
                            <IoAddOutline size={30} />
                          </div>
                          <div
                            style={{
                              borderRadius: 15,
                              height: 52,
                              display: 'flex',
                              gap: 12,
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingRight: 17,
                              paddingLeft: 17,
                              backgroundColor: '#C7CFE6',
                            }}
                          >
                            <img style={{ width: 30, height: 30 }} src='/public/empImg.svg' alt='participants' />
                            <p style={{ fontSize: 20, fontWeight: 600 }}>{values.participants.length}</p>
                          </div>
                        </div>
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
