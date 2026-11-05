import React from 'react';
import { useFarm } from './context/FarmContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BuyAssetPage from './pages/BuyAssetPage';
import SellEggPage from './pages/SellEggPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import TeamPage from './pages/TeamPage';
import './rawafiles.css';

// Export route page components for downstream milestone imports
export { LandingPage, LoginPage, DashboardPage, BuyAssetPage, SellEggPage, ChangePasswordPage };
export { TeamPage };
export const WithdrawPage = SellEggPage; // Alias as per PROJECT.md and DISPATCH.md

/**
 * App: Client-side Route Switcher and Application Shell Dispatcher
 * Supports both URL pathname and URL hash (#/route) for zero-config hosting.
 */
export default function App() {
  const farm = useFarm();
  const currentRoute = farm?.currentRoute || '/';

  // Normalize route string (remove trailing slash or hashes)
  const normalizedRoute = currentRoute.split('#')[0].replace(/\/$/, '') || '/';

  switch (normalizedRoute) {
    case '/login':
      return <LoginPage />;
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
    case '/':
    default:
      return <LandingPage />;
  }
}
