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
import './rawafiles.css';

// Export route page components for downstream milestone imports
export { LandingPage, LoginPage, RegisterPage, DashboardPage, BuyAssetPage, SellEggPage, ChangePasswordPage };
export { TeamPage };
export { AdminDashboardPage };
export const WithdrawPage = SellEggPage; // Alias as per PROJECT.md and DISPATCH.md

/**
 * App: Client-side Route Switcher and Application Shell Dispatcher
 * Supports both URL pathname and URL hash (#/route) for zero-config hosting.
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
      return <LoginPage />;
    case '/register':
      return <RegisterPage />;
    case '/dashboard':
      return <DashboardPage />;
    case '/buy-asset':
      return <BuyAssetPage />;
    case '/sell-egg':
    case '/withdraw':
      return <SellEggPage />;
    case '/change-password':
      return <ChangePasswordPage />;
    case '/team':
      return <TeamPage />;
    case '/admin':
      return <AdminDashboardPage />;
    case '/':
    default:
      return <LandingPage />;
  }
}
