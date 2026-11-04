import React, { useState } from 'react'

export default function Calculator() {
  const [selectedPlanId, setSelectedPlanId] = useState(1)
  const [quantity, setQuantity] = useState(10)

  const plans = [
    {
      id: 1,
      name: "AL Rehman Meta Eggs",
      price: 500,
      daily: 1,
      earnType: "Egg",
      unitRate: 30
    }
  ]

  const presets = [1, 5, 10, 20, 50]
  const currentPlan = plans.find((p) => p.id === Number(selectedPlanId)) || plans[0]

  const dailyUnits = quantity * currentPlan.daily
  const monthlyUnits = dailyUnits * 30
  const dailyCash = dailyUnits * currentPlan.unitRate
  const monthlyCash = dailyCash * 30

  const formatNumber = (num) =>
    Number(num || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })

  return (
    <section className="calculator-section" id="calculator">
      <div className="calculator-inner">
        <div className="calc-terminal-card reveal visible">
          {/* Compact Header */}
          <div className="calc-header-row">
            <div>
              <span className="calc-mini-badge">
                <i className="fa-solid fa-bolt-lightning"></i> PROFIT ESTIMATOR
              </span>
              <h2 className="calc-compact-title">Calculate Your Harvest Returns</h2>
            </div>
            <span className="units-badge" id="calc-units-badge">
              {quantity} units
            </span>
          </div>

          {/* Input Controls Bar */}
          <div className="calc-controls-grid">
            <div className="calc-select-wrap">
              <label htmlFor="calc-plan" className="calc-compact-label">
                Farm Plan
              </label>
              <select
                id="calc-plan"
                className="calc-select-modern"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(Number(e.target.value))}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="calc-slider-wrap">
              <div className="calc-slider-head">
                <span className="calc-compact-label">Adjust Units</span>
                <div className="calc-presets">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`calc-preset ${quantity === preset ? 'active' : ''}`}
                      onClick={() => setQuantity(preset)}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="range"
                id="calc-slider"
                className="calc-range-modern"
                min="1"
                max="50"
                value={quantity}
                step="1"
                onChange={(e) => setQuantity(Number(e.target.value))}
                aria-label="Number of units"
              />
            </div>
          </div>

          {/* 3-Column Compact Results Strip */}
          <div className="calc-metrics-strip">
            <div className="calc-metric-box">
              <div className="calc-metric-head">
                <i className="fa-solid fa-egg text-lime"></i>
                <span>Daily Yield</span>
              </div>
              <strong id="calc-daily" className="calc-metric-num">
                {formatNumber(dailyUnits)}
              </strong>
              <small id="calc-daily-type" className="calc-metric-sub">
                {currentPlan.earnType} · {currentPlan.name}
              </small>
            </div>

            <div className="calc-metric-box">
              <div className="calc-metric-head">
                <i className="fa-solid fa-money-bill-wave text-lime"></i>
                <span>Daily Cash</span>
              </div>
              <strong id="calc-daily-value" className="calc-metric-num">
                Rs. {formatNumber(dailyCash)}
              </strong>
              <small className="calc-metric-sub">Live PKR Rate</small>
            </div>

            <div className="calc-metric-box featured">
              <div className="calc-metric-head">
                <i className="fa-solid fa-crown"></i>
                <span>30-Day Estimated Profit</span>
              </div>
              <strong id="calc-month-value" className="calc-metric-num highlight">
                Rs. {formatNumber(monthlyCash)}
              </strong>
              <div className="calc-metric-sub-row">
                <small>
                  Based on 30 Days (<span id="calc-month-units">{formatNumber(monthlyUnits)}</span> Units)
                </small>
                <a href="#plans" className="calc-adopt-link">
                  Adopt <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
