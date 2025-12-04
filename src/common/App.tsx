import { Provider } from 'react-redux';
import { store } from '@common/store/store';
import { setupInterceptors } from 'src/api/instances';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AuthPage } from '../pages/AuthPage/AuthPage';
import { CalendarPage } from '../pages/CalendarPage/CalendarPage';
import { TasksPage } from '../pages/TasksPage/TasksPage';
import { Layout } from '../pages/Layout/Layout';
import { MainPage } from '../pages/MainPage/MainPage';

setupInterceptors(store);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: 'login',
        element: <AuthPage mode='login' />,
      },
      {
        path: 'reg',
        element: <AuthPage mode='reg' />,
      },
      {
        path: 'verify',
        element: <AuthPage mode='verify' />,
      },
      {
        path: 'board',
        element: <CalendarPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
    ],
  },
]);

const App = () => (
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);

export default App;
