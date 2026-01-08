import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TaskComponent } from '@modules/TasksPage/TaskComponent/TaskComponent';
import { Message } from '@modules/TasksPage/Message/Message';
import styles from './tasksPageStyle.module.scss';
import { useAppDispatch, useAppSelector } from '@common/store/hooks';
import { getProjectTasks } from '@common/store/slicer/getProjectTasksSlice';
import { getTaskById } from '@common/store/slicer/taskSlice';
import { TaskModal } from '@common/components/TaskModal/TaskModal';
import { ITask } from '@common/store/slicer/getProjectTasksSlice';

type SectionKey = 'today' | 'week' | 'overdue' | 'completed' | 'upcoming';

interface SectionState {
  items: ITask[];
  loading: boolean;
  hasMore: boolean;
  nextCursor: number | null;
}

export const TasksPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const { task: selectedTask, loading: taskLoading, error: taskError } = useAppSelector(state => state.task);

  const [sections, setSections] = useState<Record<SectionKey, SectionState>>({
    today: { items: [], loading: false, hasMore: true, nextCursor: null },
    week: { items: [], loading: false, hasMore: true, nextCursor: null },
    overdue: { items: [], loading: false, hasMore: true, nextCursor: null },
    completed: { items: [], loading: false, hasMore: true, nextCursor: null },
    upcoming: { items: [], loading: false, hasMore: true, nextCursor: null },
  });

  const projectIdNum = projectId ? Number(projectId) : null;

  useEffect(() => {
    if (!projectId || isNaN(projectIdNum!)) {
      navigate('/');
    }
  }, [projectId, navigate]);

  const loadTasks = async (section: SectionKey, cursor?: number) => {
    if (!projectIdNum) {
      return;
    }

    setSections(prev => ({
      ...prev,
      [section]: { ...prev[section], loading: true },
    }));

    const filtersMap: Record<SectionKey, 'today' | 'week' | 'overdue' | 'completed' | 'upcoming'> = {
      today: 'today',
      week: 'week',
      overdue: 'overdue',
      completed: 'completed',
      upcoming: 'upcoming',
    };

    const result = await dispatch(
      getProjectTasks({
        project_id: projectIdNum,
        cursor,
        limit: 10,
        filters: filtersMap[section],
      })
    );

    if (getProjectTasks.fulfilled.match(result)) {
      const { items, nextCursor, hasMore } = result.payload;

      setSections(prev => ({
        ...prev,
        [section]: {
          items: cursor ? [...prev[section].items, ...items] : items,
          loading: false,
          hasMore,
          nextCursor,
        },
      }));
    } else {
      setSections(prev => ({
        ...prev,
        [section]: { ...prev[section], loading: false },
      }));
    }
  };

  useEffect(() => {
    if (!projectIdNum) {
      return;
    }

    (['today', 'week', 'overdue', 'completed', 'upcoming'] as SectionKey[]).forEach(section => {
      loadTasks(section);
    });
  }, [projectIdNum]);

  const handleLoadMore = (section: SectionKey) => {
    const state = sections[section];
    if (state.hasMore && !state.loading && state.nextCursor !== null) {
      loadTasks(section, state.nextCursor);
    }
  };

  const openTaskModal = (taskId: number) => {
    if (selectedTaskId === taskId) {
      return;
    }
    setSelectedTaskId(taskId);
    dispatch(getTaskById(taskId));
  };

  const closeTaskModal = () => setSelectedTaskId(null);

  if (!projectIdNum) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.container__main}>
        <div className={styles.container__mainHeader}>
          <button onClick={() => navigate('/')} className={styles.backButton}>
            ← Back to Projects
          </button>
        </div>

        <div className={styles.container__wrapperContent}>
          {(['today', 'week', 'overdue', 'completed', 'upcoming'] as SectionKey[]).map(section => {
            const sectionData = sections[section];

            return (
              <TaskComponent
                key={section}
                taskType={section}
                hasMore={sectionData.hasMore}
                loading={sectionData.loading}
                onLoadMore={() => handleLoadMore(section)}
              >
                {sectionData.items.length > 0 ? (
                  sectionData.items.map(task => (
                    <Message
                      key={task.id}
                      title={task.name}
                      message={task.description || ''}
                      task={task}
                      onClick={() => openTaskModal(task.id)}
                    />
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    No tasks{' '}
                    {section === 'today'
                      ? 'for today'
                      : section === 'week'
                        ? 'this week'
                        : section === 'completed'
                          ? 'yet'
                          : `in ${section}`}
                  </div>
                )}
              </TaskComponent>
            );
          })}
        </div>
      </div>

      <TaskModal
        isOpen={selectedTaskId !== null}
        onClose={closeTaskModal}
        currentDate={new Date()}
        //@ts-ignore
        task={selectedTask}
        loading={taskLoading}
        error={taskError}
      />
    </div>
  );
};
