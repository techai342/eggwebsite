import React from 'react'
import logoImg from '../assets/logo.webp'
import henImg from '../assets/hen.png'
import eggCoinImg from '../assets/egg.png'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span>
            A fresh approach to poultry
          </div>

          <h1>
            {/* Row 1 */}
            <div className="hero-row-1">
              <span className="hero-word-nature">NATURE'S</span>
              <span className="hero-tag-glow">
                <i className="fa-solid fa-wheat-awn"></i> AGRO FARM
              </span>
            </div>

            {/* Row 2 */}
            <div className="hero-row-2">
              <span className="hero-word-harvest">GOLDEN HARVEST</span>
              <span className="hero-sparkle-star">✦</span>
            </div>
          </h1>

          <p className="hero-description">
            Discover our digital farm experience, explore available
            poultry products, and learn about hens, egg production
            and modern farming.
          </p>

          <div className="hero-buttons">
            <a href="#plans" className="btn btn-lime">
              Explore Plans <i className="fa-solid fa-arrow-right"></i>
            </a>
            <a href="#calculator" className="btn btn-outline">
              Calculate Profit <i className="fa-solid fa-calculator"></i>
            </a>
          </div>

          <div className="hero-points">
            <span><i className="fa-solid fa-leaf"></i> Poultry First</span>
            <span><i className="fa-solid fa-egg"></i> Egg Production</span>
            <span><i className="fa-solid fa-seedling"></i> Farm Focused</span>
          </div>
        </div>

        {/* Dynamic Orbit Stage: Center Main Image with 6 Balanced Rotating Satellites */}
        <div className="farm-stage" aria-label="Dynamic Farm Orbit Ecosystem">
          <div className="stage-glow"></div>

          {/* Ambient Stage Twinkles */}
          <span className="stage-ambient-sparkle sparkle-pos-1"></span>
          <span className="stage-ambient-sparkle sparkle-pos-2"></span>
          <span className="stage-ambient-sparkle sparkle-pos-3"></span>
          <span className="stage-ambient-sparkle sparkle-pos-4"></span>

          {/* Ambient Orbital Trajectories */}
          <div className="orbit-track orbit-track-secondary"></div>
          <div className="orbit-track orbit-track-tertiary"></div>

          {/* Inner Counter-Rotating Orbit Ring with 3 Micro Dots */}
          <div className="orbit-track orbit-track-inner">
            <div className="orbit-inner-dot" style={{ transform: 'rotate(0deg)' }}></div>
            <div className="orbit-inner-dot" style={{ transform: 'rotate(120deg)' }}></div>
            <div className="orbit-inner-dot" style={{ transform: 'rotate(240deg)' }}></div>
          </div>

          {/* Primary Synchronized Rotating Orbit Ring (6 Balanced Satellites + 6 Constellation Pips) */}
          <div className="orbit-track orbit-track-primary">
            {/* 6 Constellation Sparkle Pips */}
            <div className="orbit-constellation-pip" style={{ transform: 'rotate(30deg)' }}></div>
            <div className="orbit-constellation-pip" style={{ transform: 'rotate(90deg)' }}></div>
            <div className="orbit-constellation-pip" style={{ transform: 'rotate(150deg)' }}></div>
            <div className="orbit-constellation-pip" style={{ transform: 'rotate(210deg)' }}></div>
            <div className="orbit-constellation-pip" style={{ transform: 'rotate(270deg)' }}></div>
            <div className="orbit-constellation-pip" style={{ transform: 'rotate(330deg)' }}></div>

            {/* 6 Major Dynamic Satellites */}
            <div className="orbit-satellite-arm" style={{ transform: 'rotate(0deg)' }}>
              <div
                className="orbit-satellite-node"
                style={{
                  border: '2.5px solid #c9f36a',
                  boxShadow: '0 8px 22px rgba(0,0,0,.26), 0 0 16px rgba(201,243,106,0.75)'
                }}
                title="Egg"
              >
                <img src={logoImg} alt="Egg" loading="lazy" />
              </div>
            </div>

            <div className="orbit-satellite-arm" style={{ transform: 'rotate(60deg)' }}>
              <div
                className="orbit-satellite-node"
                style={{
                  border: '2.5px solid #fbbf24',
                  boxShadow: '0 8px 22px rgba(0,0,0,.26), 0 0 16px rgba(251,191,36,0.75)'
                }}
                title="Daily Rs Profit"
              >
                <img src={eggCoinImg} alt="Daily Rs Profit" loading="lazy" />
              </div>
            </div>

            <div className="orbit-satellite-arm" style={{ transform: 'rotate(120deg)' }}>
              <div
                className="orbit-satellite-node"
                style={{
                  border: '2.5px solid #34d399',
                  boxShadow: '0 8px 22px rgba(0,0,0,.26), 0 0 16px rgba(52,211,153,0.75)'
                }}
                title="Fresh Yield"
              >
                <img src={logoImg} alt="Fresh Yield" loading="lazy" />
              </div>
            </div>

            <div className="orbit-satellite-arm" style={{ transform: 'rotate(180deg)' }}>
              <div
                className="orbit-satellite-node"
                style={{
                  border: '2.5px solid #4ade80',
                  boxShadow: '0 8px 22px rgba(0,0,0,.26), 0 0 16px rgba(74,222,128,0.75)'
                }}
                title="AL Rehman Meta Eggs"
              >
                <img src={henImg} alt="AL Rehman Meta Eggs" loading="lazy" />
              </div>
            </div>

            <div className="orbit-satellite-arm" style={{ transform: 'rotate(240deg)' }}>
              <div
                className="orbit-satellite-node"
                style={{
                  border: '2.5px solid #f59e0b',
                  boxShadow: '0 8px 22px rgba(0,0,0,.26), 0 0 16px rgba(245,158,11,0.75)'
                }}
                title="Instant Payout"
              >
                <img src={eggCoinImg} alt="Instant Payout" loading="lazy" />
              </div>
            </div>

            <div className="orbit-satellite-arm" style={{ transform: 'rotate(300deg)' }}>
              <div
                className="orbit-satellite-node"
                style={{
                  border: '2.5px solid #a3e635',
                  boxShadow: '0 8px 22px rgba(0,0,0,.26), 0 0 16px rgba(163,230,53,0.75)'
                }}
                title="Golden Harvest"
              >
                <img src={logoImg} alt="Golden Harvest" loading="lazy" />
              </div>
            </div>
          </div>

          {/* Center Core: Dynamic Primary Plan Image */}
          <div className="hero-center-wrapper">
            <div className="hero-center-aura"></div>
            <div className="hero-center-disc">
              <img src={henImg} alt="AL Rehman Meta Eggs" className="hero-center-img" />
            </div>
          </div>

          {/* Floating Left Info Badge */}
          <div className="hero-label">
            <strong><i className="fa-solid fa-seedling"></i> AL Rehman Meta Eggs</strong>
            <span>Verified Eco-Farm</span>
          </div>

          {/* Floating Right Dynamic Yield Badge */}
          <div className="egg-float">
            <img src={logoImg} alt="Egg" />
            <span>EGG</span>
          </div>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>01</strong>
            <span>Poultry Focus</span>
          </div>
          <div className="hero-stat">
            <strong>24/7</strong>
            <span>Online Access</span>
          </div>
          <div className="hero-stat">
            <strong>360°</strong>
            <span>Farm Experience</span>
          </div>
        </div>
      </div>
    </section>
  )
}
