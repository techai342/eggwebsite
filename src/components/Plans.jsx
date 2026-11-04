import React from 'react'

export default function Plans() {
  const plans = [
    {
      id: 1,
      name: "AL Rehman Meta Eggs",
      price: "500.00",
      daily: 1,
      validity: 120,
      earnType: "Egg",
      unitRate: 30,
      totalReturn: "3,600.00",
      image: "/assets/1791906408_1_image.png",
      tag: "Active Batch",
      perks: [
        "Automated Daily Egg Collection",
        "Instant Wallet Cashout Support",
        "100% Bio-Care & Health Monitored"
      ]
    }
  ]

  return (
    <section className="plans-section" id="plans">
      <div className="plans-heading-wrap reveal visible">
        <span className="plans-eyebrow">
          <i className="fa-solid fa-wheat-awn"></i> HIGH-YIELD INVESTMENT PACKS
        </span>
        <h2 className="plans-title">
          Choose Your Flock. <br />
          <span className="plans-title-highlight">Start Harvesting Daily Profit.</span>
        </h2>
        <p className="plans-desc">
          Select an active production plan to initiate automated daily egg collection and instant wallet returns. Transparent cycle terms with zero hidden fees.
        </p>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <article key={plan.id} className="plan-card-pro reveal visible">
            {/* Top Visual 3D Showcase with Dynamic Orbit & Hen Motion */}
            <div className="plan-header-art">
              <div className="plan-mesh-dots"></div>
              <div className="plan-aurora-glow"></div>

              {/* Revolving Orbit Ring with Rotating Eggs & Sparkle */}
              <div className="plan-orbit-stage" aria-hidden="true">
                <div className="plan-orbit-ring">
                  <div className="plan-orbit-item item-egg-1">
                    <div className="plan-mini-egg" title="Fresh Egg">
                      <i className="fa-solid fa-egg"></i>
                    </div>
                  </div>
                  <div className="plan-orbit-item item-star">
                    <div className="plan-mini-star" title="Bonus Yield">
                      <i className="fa-solid fa-star"></i>
                    </div>
                  </div>
                  <div className="plan-orbit-item item-egg-2">
                    <div className="plan-mini-egg gold" title="Golden Egg">
                      <i className="fa-solid fa-egg"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Badges */}
              <span className="plan-top-badge-left">
                <i className="fa-solid fa-egg"></i> {plan.name}
              </span>

              <span className="plan-top-badge-right">
                <i className="fa-regular fa-clock"></i> {plan.validity} Days
              </span>

              {/* Animated Hen / Asset Stage */}
              <div className="plan-avatar-stage">
                <div className="plan-avatar-shadow"></div>
                <img
                  src={plan.image}
                  alt={plan.name}
                  className="plan-3d-img"
                  loading="lazy"
                />
              </div>

              {/* Floating Live Status Chips */}
              <div className="plan-float-chip left">
                <span className="pulse-chip-dot"></span> Live Producer
              </div>
              <div className="plan-float-chip right">
                <i className="fa-solid fa-bolt text-lime"></i> Auto-Collect
              </div>
            </div>

            {/* Plan Body */}
            <div className="plan-body-pro">
              <div className="plan-title-row">
                <h3 className="plan-title-pro">{plan.name}</h3>
                <span className="plan-batch-pill">
                  <i className="fa-solid fa-circle-check"></i> {plan.tag}
                </span>
              </div>

              {/* Price & Daily Yield Highlight */}
              <div className="plan-price-card">
                <div>
                  <span className="plan-price-label">Adoption Price</span>
                  <div className="plan-price-num">Rs. {plan.price}</div>
                </div>
                <div className="plan-daily-pill">
                  <strong>+{plan.daily} {plan.earnType}</strong>
                  <span>Per 24h Cycle</span>
                </div>
              </div>

              {/* 2x2 Specs Bento Grid */}
              <div className="plan-specs-grid">
                <div className="plan-spec-item">
                  <span className="plan-spec-key"><i className="fa-solid fa-chart-line"></i> Daily Yield</span>
                  <span className="plan-spec-val">{plan.daily} {plan.earnType}/day</span>
                </div>
                <div className="plan-spec-item">
                  <span className="plan-spec-key"><i className="fa-regular fa-calendar-check"></i> Duration</span>
                  <span className="plan-spec-val">{plan.validity} Days</span>
                </div>
                <div className="plan-spec-item">
                  <span className="plan-spec-key"><i className="fa-solid fa-money-bill-wave"></i> Daily Cash</span>
                  <span className="plan-spec-val highlight">Rs. {plan.unitRate}.00</span>
                </div>
                <div className="plan-spec-item">
                  <span className="plan-spec-key"><i className="fa-solid fa-coins"></i> Total Return</span>
                  <span className="plan-spec-val highlight">Rs. {plan.totalReturn}</span>
                </div>
              </div>

              {/* Mini Perks */}
              <div className="plan-perks-row">
                {plan.perks.map((perk, i) => (
                  <div key={i} className="plan-perk">
                    <i className="fa-solid fa-circle-check"></i> {perk}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <a href="#calculator" className="plan-adopt-btn">
                <span>Adopt Flock &amp; Start Earning</span>
                <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
