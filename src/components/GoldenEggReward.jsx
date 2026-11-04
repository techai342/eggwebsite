import React, { useState } from 'react'

export default function GoldenEggReward() {
  const [crackedId, setCrackedId] = useState(null)
  const [claimed, setClaimed] = useState(false)

  const eggs = [
    {
      id: 1,
      name: 'Incubator Alpha',
      badge: 'High Yield Flock',
      reward: '+5 Bonus Eggs (Rs. 150 Value)',
      icon: 'fa-egg',
      color: '#c9f36a'
    },
    {
      id: 2,
      name: 'Imperial Golden Nest',
      badge: 'VIP Mystery Harvest',
      reward: '2x Speed Turbo Booster',
      icon: 'fa-bolt-lightning',
      color: '#ffd700'
    },
    {
      id: 3,
      name: 'Celestial Roost',
      badge: 'Daily Farm Cashback',
      reward: 'Rs. 250 Farm Cash Voucher',
      icon: 'fa-coins',
      color: '#38bdf8'
    }
  ]

  const handleCrack = (id) => {
    if (crackedId !== null) return
    setCrackedId(id)
  }

  const handleReset = () => {
    setCrackedId(null)
    setClaimed(false)
  }

  const handleClaim = () => {
    setClaimed(true)
  }

  return (
    <section className="bounty-section" id="daily-bounty">
      <div className="bounty-ambient-stars"></div>

      <div className="bounty-inner">
        <div className="reveal visible">
          <span className="bounty-eyebrow">
            <i className="fa-solid fa-gift"></i> DAILY GAMIFIED HARVEST BOUNTY
          </span>
          <h2 className="bounty-title">
            Crack the Golden Egg. <br />
            <span className="bounty-title-highlight">Claim Your Daily Farm Bonus.</span>
          </h2>
          <p className="bounty-desc">
            Pick one of the three temperature-controlled incubator eggs below. Tap to crack it open and uncover instant egg boosts, cash vouchers, or turbo multipliers!
          </p>
        </div>

        {/* 3 Interactive Eggs */}
        <div className="bounty-eggs-grid">
          {eggs.map((egg) => {
            const isCracked = crackedId === egg.id
            const isOtherCracked = crackedId !== null && !isCracked

            return (
              <div
                key={egg.id}
                className={`bounty-card ${isCracked ? 'cracked' : ''}`}
                style={{
                  opacity: isOtherCracked ? 0.45 : 1,
                  filter: isOtherCracked ? 'grayscale(0.6)' : 'none',
                  cursor: crackedId !== null ? 'default' : 'pointer'
                }}
                onClick={() => handleCrack(egg.id)}
              >
                <div className="egg-aura-glow"></div>

                {/* 3D Golden Egg Visual */}
                <div
                  className="egg-3d-visual"
                  style={
                    isCracked
                      ? {
                          transform: 'scale(1.08) rotate(4deg)',
                          boxShadow: '0 0 35px rgba(201, 243, 106, 0.8), inset 0 0 15px #fff'
                        }
                      : {}
                  }
                >
                  {isCracked && (
                    <div className="egg-crack-overlay">
                      <span>⚡</span>
                    </div>
                  )}
                </div>

                <div className="bounty-card-info" style={{ width: '100%' }}>
                  <div className="bounty-card-title">{egg.name}</div>
                  <div className="bounty-card-sub">{egg.badge}</div>

                  {isCracked ? (
                    <div className="bounty-reveal-pill">
                      <i className={`fa-solid ${egg.icon}`}></i> {egg.reward}
                    </div>
                  ) : (
                    <div className="bounty-tap-hint">
                      <i className="fa-solid fa-hand-pointer"></i> Tap to Crack
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Controls after crack */}
        {crackedId !== null && (
          <div className="bounty-actions-row reveal visible">
            {!claimed ? (
              <button
                type="button"
                className="bounty-claim-btn"
                onClick={handleClaim}
              >
                <i className="fa-solid fa-circle-check"></i> Claim Bounty to Wallet
              </button>
            ) : (
              <div className="bounty-claimed-alert">
                <i className="fa-solid fa-champagne-glasses"></i> Bonus successfully credited to your farm account!
              </div>
            )}

            <button
              type="button"
              className="bounty-reset-btn"
              onClick={handleReset}
            >
              <i className="fa-solid fa-arrows-rotate"></i> Crack Another Egg
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
