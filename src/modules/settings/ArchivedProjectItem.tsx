import React from 'react';
import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import styles from './archivedProjectItem.module.scss';

interface ArchivedProjectItemProps {
  projectName: string;
  creatorName: string;
  onRestore: () => void;
  isRestoring?: boolean;
}

export const ArchivedProjectItem: React.FC<ArchivedProjectItemProps> = ({
  projectName,
  creatorName,
  onRestore,
  isRestoring = false,
}) => (
  <div className={styles.container}>
    <div className={styles.container__info}>
      <h3 className={styles.container__projectName}>{projectName}</h3>
      <p className={styles.container__creator}>
        Created by <span className={styles.container__creatorName}>{creatorName}</span>
      </p>
    </div>

    <HeaderButton onClick={onRestore} disabled={isRestoring} className={styles.container__restoreButton}>
      {isRestoring ? 'Restoring...' : 'Restore'}
    </HeaderButton>
  </div>
);
