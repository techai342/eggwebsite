import React from 'react'

export default function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-grid reveal visible">
        {/* 3D Interactive Farm Showcase */}
        <div className="about-showcase" aria-label="Interactive Farm Showcase">
          <div className="about-showcase-mesh"></div>
          <div className="about-showcase-ring"></div>
          <div className="about-showcase-glow"></div>

          {/* Floating Live Production Badge */}
          <div className="about-badge about-badge-top">
            <span className="about-pulse-dot"></span>
            <div className="about-badge-text">
              <strong>Live Poultry Farm</strong>
              <span>24/7 Monitored Yield</span>
            </div>
          </div>

          {/* Central Circular Farm Photo */}
          <div className="about-center-avatar" aria-label="Organic Farm Flock & Fresh Eggs">
            <div className="about-avatar-frame">
              <img
                src="/assets/360_F_854433524_58tbvMvWTqyYvjzt0HWyMIjkPs5SKT5E.jpg"
                alt="AL Rehman Meta Eggs Poultry & Fresh Eggs"
                loading="lazy"
              />
            </div>
          </div>

          {/* Floating Eco-Certified Trust Badge */}
          <div className="about-badge about-badge-bottom">
            <i className="fa-solid fa-certificate" style={{ color: '#c9f36a', fontSize: '16px' }}></i>
            <div className="about-badge-text">
              <strong>100% Organic Flocks</strong>
              <span>Bio-Feed &amp; Daily Care</span>
            </div>
          </div>
        </div>

        {/* About Content & Bento Features */}
        <div className="about-content">
          <span className="about-eyebrow">
            <i className="fa-solid fa-wheat-awn"></i> ABOUT OUR DIGITAL ECO-FARM
          </span>

          <h2 className="about-title">
            Rooted in Nature. <br />
            <span className="about-title-highlight">Engineered for Daily Growth.</span>
          </h2>

          <p className="about-lead">
            AL Rehman Meta Eggs bridges sustainable bio-poultry breeding with automated digital rewards. Experience direct access to active hen cycles, automated egg collection, and guaranteed daily yield.
          </p>

          {/* 4 Compact Bento Micro-Cards */}
          <div className="about-bento-grid">
            <div className="about-bento-card">
              <div className="about-bento-header">
                <div className="about-bento-icon"><i className="fa-solid fa-egg"></i></div>
                <span className="about-bento-pill">Auto</span>
              </div>
              <h4>Daily Egg Yield</h4>
              <p>Continuous 24-hour production with automated egg collection.</p>
            </div>

            <div className="about-bento-card">
              <div className="about-bento-header">
                <div className="about-bento-icon"><i className="fa-solid fa-seedling"></i></div>
                <span className="about-bento-pill">Organic</span>
              </div>
              <h4>100% Bio Nutrition</h4>
              <p>Clinically supervised flocks fed on premium natural grains.</p>
            </div>

            <div className="about-bento-card">
              <div className="about-bento-header">
                <div className="about-bento-icon"><i className="fa-solid fa-bolt-lightning"></i></div>
                <span className="about-bento-pill">Instant</span>
              </div>
              <h4>Fast Cashout</h4>
              <p>Exchange harvested farm yield into cash anytime with zero delay.</p>
            </div>

            <div className="about-bento-card">
              <div className="about-bento-header">
                <div className="about-bento-icon"><i className="fa-solid fa-shield-halved"></i></div>
                <span className="about-bento-pill">Verified</span>
              </div>
              <h4>Safe &amp; Transparent</h4>
              <p>Fixed cycle durations, clear profit rates, and 24/7 wallet security.</p>
            </div>
          </div>

          {/* Bottom Trust Metrics & CTA */}
          <div className="about-bottom-strip">
            <div className="about-trust-items">
              <div className="about-trust-item"><i className="fa-solid fa-circle-check"></i> 100% Automated</div>
              <div className="about-trust-item"><i className="fa-solid fa-circle-check"></i> Zero Hidden Fees</div>
              <div className="about-trust-item"><i className="fa-solid fa-circle-check"></i> Instant Payout</div>
            </div>
            <a href="#plans" className="about-action-btn">
              Explore Plans <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
