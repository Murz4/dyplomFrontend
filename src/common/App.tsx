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
import { SettingsPage } from '@pages/SettingsPage/SettingsPage';
import { InviteHandlerPage } from '@pages/InviteHandlerPage/InviteHandlerPage';
import { Toaster } from 'react-hot-toast';

setupInterceptors(store);

const router = createBrowserRouter([
  {
    path: '/projects/join/:token',
    element: <InviteHandlerPage />,
  },
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
        path: 'change-password',
        element: <AuthPage mode='change-password' />,
      },
      {
        path: 'create-new-password',
        element: <AuthPage mode='create-new-password' />,
      },
      {
        path: 'password-changed',
        element: <AuthPage mode='password-changed' />,
      },
      {
        path: 'calendar',
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
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const App = () => (
  <Provider store={store}>
    <RouterProvider router={router} />
    <Toaster
      position='top-right'
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '16px',
        },
      }}
    />
  </Provider>
);

export default App;
