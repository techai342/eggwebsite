import React from 'react'
import { useFarm } from '../context/FarmContext'

export default function Navbar() {
  const farm = useFarm();
  const user = farm?.user;

  return (
    <header className="site-header">
      <div className="nav-inner">
        <a href="#top" className="brand" aria-label="AL Rehman Meta Eggs home">
          <div className="brand-mark">
            <i className="fa-solid fa-egg"></i>
          </div>
          <div>
            <div className="brand-name">AL Rehman Meta Eggs</div>
            <div className="brand-sub">POULTRY &amp; FARM</div>
          </div>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#plans">Farm Plans</a>
          <a href="#telemetry">IoT Telemetry</a>
          <a href="#simulation">Live Coop</a>
          <a href="#calculator">Calculator</a>
          <a href="#daily-bounty">Daily Bounty</a>
          <a href="#faqs">FAQs</a>
        </nav>

        <div className="nav-actions">
          {user?.isLoggedIn ? (
            <a
              href="#/dashboard"
              className="btn btn-lime nav-register"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== 'undefined') {
                  window.location.hash = '#/dashboard';
                }
              }}
            >
              <i className="fa-solid fa-gauge-high"></i> Dashboard
            </a>
          ) : (
            <>
              <a
                href="#/login"
                className="btn btn-dark"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== 'undefined') {
                    window.location.hash = '#/login';
                  }
                }}
              >
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                Login
              </a>
              <a
                href="#/register"
                className="btn btn-lime nav-register"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== 'undefined') {
                    window.location.hash = '#/register';
                  }
                }}
              >
                Get Started <i className="fa-solid fa-arrow-right"></i>
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
