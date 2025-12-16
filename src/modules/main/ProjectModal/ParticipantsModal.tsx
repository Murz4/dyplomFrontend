import { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import styles from './participantsModal.module.scss';

interface Participant {
  user: {
    id: number;
    full_name: string;
    email: string;
  };
}

interface ParticipantsModalProps {
  onClosed: () => void;
  participants: Participant[];
  loading?: boolean;
}

export const ParticipantsModal = ({ onClosed, participants, loading = false }: ParticipantsModalProps) => {
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const handleParticipantClick = (participant: Participant) => {
    setSelectedParticipant(participant);
  };

  const handleBack = () => {
    setSelectedParticipant(null);
  };

  const handleDelete = () => {
    console.log('Delete user:', selectedParticipant);
    setSelectedParticipant(null);
  };

  return (
    <div onClick={onClosed} className={styles.container__wrapper}>
      <div onClick={e => e.stopPropagation()} className={styles.container}>
        <button onClick={onClosed} className={styles.container__closeButton} aria-label='Close modal'>
          <IoCloseOutline size={30} color='#333' />
        </button>

        {!selectedParticipant ? (
          <div className={styles.container__participantsView}>
            <div className={styles.container__header}>
              <h2 className={styles.container__title}>Participants</h2>
              <button className={styles.container__addButton} aria-label='Add participant'>
                +
              </button>
            </div>

            {loading ? (
              <div className={styles.container__loadingState}>
                <div className={styles.container__spinner} />
                <p className={styles.container__loadingText}>Loading participants...</p>
              </div>
            ) : participants.length === 0 ? (
              <div className={styles.container__emptyState}>
                <p className={styles.container__emptyText}>No participants yet</p>
              </div>
            ) : (
              <div className={styles.container__participantsList}>
                {participants.map(participant => (
                  <div
                    key={participant.user.id}
                    className={styles.container__participantItem}
                    onClick={() => handleParticipantClick(participant)}
                  >
                    <div className={styles.container__avatar}>
                      <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                        <circle cx='12' cy='12' r='10' fill='#4A5568' />
                        <path
                          d='M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z'
                          fill='white'
                        />
                        <path
                          d='M6 18C6 15.7909 7.79086 14 10 14H14C16.2091 14 18 15.7909 18 18V19H6V18Z'
                          fill='white'
                        />
                      </svg>
                    </div>
                    <span className={styles.container__participantName}>{participant.user.full_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.container__profileView}>
            <button className={styles.container__backButton} onClick={handleBack} aria-label='Go back'>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M15 18L9 12L15 6'
                  stroke='#2d3748'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>

            <button className={styles.container__deleteButton} onClick={handleDelete} aria-label='Delete user'>
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                <path
                  d='M4 5H16M8 9V15M12 9V15M5 5L6 17C6 17.5304 6.21071 18.0391 6.58579 18.4142C6.96086 18.7893 7.46957 19 8 19H12C12.5304 19 13.0391 18.7893 13.4142 18.4142C13.7893 18.0391 14 17.5304 14 17L15 5M9 5V3C9 2.73478 9.10536 2.48043 9.29289 2.29289C9.48043 2.10536 9.73478 2 10 2C10.2652 2 10.5196 2.10536 10.7071 2.29289C10.8946 2.48043 11 2.73478 11 3V5'
                  stroke='#e53e3e'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>

            <div className={styles.container__profileContent}>
              <div className={styles.container__avatarLarge}>
                <svg width='64' height='64' viewBox='0 0 64 64' fill='none'>
                  <circle cx='32' cy='32' r='32' fill='#2d3748' />
                  <path
                    d='M32 32C36.4183 32 40 28.4183 40 24C40 19.5817 36.4183 16 32 16C27.5817 16 24 19.5817 24 24C24 28.4183 27.5817 32 32 32Z'
                    fill='white'
                  />
                  <path d='M16 48C16 42.4772 20.4772 38 26 38H38C43.5228 38 48 42.4772 48 48V51H16V48Z' fill='white' />
                </svg>
              </div>

              <h2 className={styles.container__name}>{selectedParticipant.user.full_name}</h2>
              <p className={styles.container__email}>{selectedParticipant.user.email}</p>

              <div className={styles.container__roleBadge}>
                <span className={styles.container__roleText}>{selectedParticipant.user.full_name}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
