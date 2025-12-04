import { TaskComponent } from '@modules/TasksPage/TaskComponent/TaskComponent';
import styles from './tasksPageStyle.module.scss';
import { Message } from '@modules/TasksPage/Message/Message';

export const TasksPage = () => {
  const messageArray = [
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
    { title: 'asdasdsad', message: 'asdsadsadsadsadas' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.container__main}>
        <div className={styles.container__mainHeader} />
        <div className={styles.container__wrapperContent}>
          <TaskComponent taskType={'today'}>
            {messageArray.map((item, index) => (
              <Message key={index} title={item.title} message={item.message} />
            ))}
          </TaskComponent>
          <TaskComponent taskType={'week'}>
            {messageArray.map((item, index) => (
              <Message key={index} title={item.title} message={item.message} />
            ))}
          </TaskComponent>
          <TaskComponent taskType={'urgently'}>
            {messageArray.map((item, index) => (
              <Message key={index} title={item.title} message={item.message} />
            ))}
          </TaskComponent>
        </div>
      </div>
    </div>
  );
};
