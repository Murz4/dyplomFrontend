import { Provider } from 'react-redux';
import { store } from '@common/store/store';
import { AuthPage } from '@pages/authPage/AuthPage';
import { setupInterceptors } from 'src/api/instances';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { MainPage } from '@pages/MainPage/MainPage';
import { Layout } from '@pages/Layout/Layout';
import { CalendarPage } from '@pages/CalendarPage/CalendarPage';
import { TasksPage } from '@pages/TasksPage/TasksPage';
import { ProtectedRoute } from '@pages/Layout/ProtectedRoute';
import { PublicRoute } from '@pages/Layout/PublicRoute';

setupInterceptors(store);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <AuthPage mode='login' />
          </PublicRoute>
        ),
      },
      {
        path: 'reg',
        element: (
          <PublicRoute>
            <AuthPage mode='reg' />
          </PublicRoute>
        ),
      },
      {
        path: 'verify',
        element: (
          <PublicRoute>
            <AuthPage mode='verify' />
          </PublicRoute>
        ),
      },
      {
        path: 'verified-email',
        element: (
          <PublicRoute>
            <AuthPage mode='verified-email' />
          </PublicRoute>
        ),
      },
      {
        path: 'board',
        element: (
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks',
        element: (
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        ),
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
