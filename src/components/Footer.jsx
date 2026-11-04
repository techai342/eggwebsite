import React from 'react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <a href="#top" className="brand footer-brand">
            <div className="brand-mark">
              <i className="fa-solid fa-egg"></i>
            </div>
            <div>
              <div className="brand-name">AL Rehman Meta Eggs</div>
              <div className="brand-sub">POULTRY &amp; FARM</div>
            </div>
          </a>
          <p className="footer-description">
            A modern, mobile-friendly interface for exploring poultry
            products and available farm categories.
          </p>
        </div>

        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#plans">Farm Plans</a>
          <a href="#simulation">Live Coop</a>
          <a href="#calculator">Calculator</a>
          <a href="#faqs">FAQs</a>
          <a href="https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j" target="_blank" rel="noopener noreferrer">
            Community
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 AL Rehman Meta Eggs. All rights reserved.
        Please review the applicable product terms before proceeding.
      </div>
    </footer>
  )
}
