import React from 'react';
import styles from './stepItemStyle.module.scss';

interface StepItemProps {
  currentStep: number;
  totalSteps: number;
}

export const StepItem: React.FC<StepItemProps> = ({ currentStep, totalSteps }) => (
  <div className={styles.stepItem}>
    {Array.from({ length: totalSteps }).map((_, index) => (
      <div
        key={index}
        className={`${styles.stepItem__line} ${index < currentStep ? styles.stepItem__line_active : ''}`}
      />
    ))}
  </div>
);
