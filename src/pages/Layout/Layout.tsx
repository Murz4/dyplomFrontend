import { Header } from '@common/components/Header/Header';
import { Outlet } from 'react-router';
import { useAppSelector } from '@common/store/hooks';

export const Layout = () => {
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated);

  return (
    <div>
      {isAuthenticated && <Header />}
      <div>
        <Outlet />
      </div>
    </div>
  );
};
