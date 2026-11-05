import React from 'react';
import { useFarm } from './context/FarmContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BuyAssetPage from './pages/BuyAssetPage';
import SellEggPage from './pages/SellEggPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import TeamPage from './pages/TeamPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MyFarmPage from './pages/MyFarmPage';
import './rawafiles.css';

// Export route page components for downstream milestone imports
export { LandingPage, LoginPage, DashboardPage, BuyAssetPage, SellEggPage, ChangePasswordPage };
export { RegisterPage };
export { TeamPage };
export { AdminDashboardPage };
export { MyFarmPage };
export const WithdrawPage = SellEggPage; // Alias as per PROJECT.md and DISPATCH.md

/**
 * App: Client-side Route Switcher and Application Shell Dispatcher
 * Supports both URL pathname and URL hash (#/route) for zero-config hosting.
 * Handles primary paths and canonical raw aliases (/deposit, /withdraw, /my-farm, /farm, /home).
 */
export default function App() {
  const farm = useFarm();
  const currentRoute = farm?.currentRoute || '/';

  // Normalize route string (strip query strings, leading hashes, anchor fragments, trailing slashes)
  let cleanRoute = (currentRoute || '/').split('?')[0];
  cleanRoute = cleanRoute.replace(/^\/?#\/?/, '/');
  cleanRoute = cleanRoute.split('#')[0];
  if (!cleanRoute.startsWith('/')) cleanRoute = '/' + cleanRoute;
  const normalizedRoute = cleanRoute.replace(/\/$/, '') || '/';

  switch (normalizedRoute) {
    case '/login':
    case '/user/login':
      return <LoginPage />;

    case '/register':
    case '/user/register':
      return <RegisterPage />;

    case '/dashboard':
    case '/home':
    case '/user/dashboard':
      return <DashboardPage />;

    case '/my-farm':
    case '/farm':
    case '/user/farm':
      return <MyFarmPage />;

    case '/buy-asset':
    case '/deposit':
    case '/buy':
    case '/user/deposit':
      return <BuyAssetPage />;

    case '/sell-egg':
    case '/withdraw':
    case '/sale':
    case '/user/withdraw':
      return <SellEggPage />;

    case '/change-password':
    case '/user/change-password':
    case '/profile':
      return <ChangePasswordPage />;

    case '/team':
    case '/user/referred-users':
    case '/affiliates':
      return <TeamPage />;

    case '/admin':
    case '/super-admin':
    case '/admin/dashboard':
      return <AdminDashboardPage />;

    case '/':
    default:
      return <LandingPage />;
  }
}
