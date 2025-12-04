import { Header } from '@common/components/Header/Header';
import { Outlet } from 'react-router';

export const Layout = () => (
  <div>
    <Header />
    <div>
      <Outlet />
    </div>
  </div>
);
