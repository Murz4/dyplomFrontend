import { ReactNode, useEffect, useRef } from 'react';
import styles from './TaskComponentStyle.module.scss';

interface TaskComponentProps {
  taskType: 'today' | 'week' | 'overdue' | 'completed' | 'upcoming';
  children: ReactNode;
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
}

const TASK_CONFIG = {
  today: {
    label: 'Today',
    headerClass: styles.container__headerToday,
    containerClass: styles.container__containerPrimary,
    contentClass: styles.container__contentPrimary,
  },
  week: {
    label: 'This Week',
    headerClass: styles.container__headerWeek,
    containerClass: styles.container__containerSecondary,
    contentClass: styles.container__contentSecondary,
  },
  overdue: {
    label: 'Overdue',
    headerClass: styles.container__headerOverdue,
    containerClass: styles.container__containerPrimary,
    contentClass: styles.container__contentPrimary,
  },
  completed: {
    label: 'Completed',
    headerClass: styles.container__headerCompleted,
    containerClass: styles.container__containerPrimary,
    contentClass: styles.container__contentPrimary,
  },
  upcoming: {
    label: 'Upcoming',
    headerClass: styles.container__headerUpcoming,
    containerClass: styles.container__containerSecondary,
    contentClass: styles.container__contentSecondary,
  },
} as const;

export const TaskComponent = ({
  taskType,
  children,
  hasMore = false,
  loading = false,
  onLoadMore,
}: TaskComponentProps) => {
  const config = TASK_CONFIG[taskType];
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [onLoadMore, hasMore, loading]);

  return (
    <div className={`${styles.container} ${config.containerClass}`}>
      <div className={`${styles.container__headerWrapper} ${config.headerClass}`}>
        <p className={styles.container__title}>{config.label}</p>
      </div>

      <div className={styles.container__main}>
        <div className={`${styles.container__content} ${config.contentClass}`}>
          {children}

          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p>Loading more...</p>
            </div>
          )}

          {hasMore && !loading && <div ref={observerTarget} className={styles.observerTrigger} />}
        </div>
      </div>
    </div>
  );
};
