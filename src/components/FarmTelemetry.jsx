import React, { useState, useEffect } from 'react'

export default function FarmTelemetry() {
  const [activeCoop, setActiveCoop] = useState('alpha')
  const [isNightMode, setIsNightMode] = useState(false)
  const [telemetryValues, setTelemetryValues] = useState({
    temp: 23.4,
    humidity: 58.2,
    silo: 89,
    energy: 97,
    aqi: 99.5,
    health: 99.8
  })
  const [isCalibrating, setIsCalibrating] = useState(false)

  const coops = {
    alpha: {
      name: 'Coop Alpha',
      flock: 'Golden High-Yield Layers',
      birds: '1,250 Birds',
      baseTemp: 23.2,
      baseHum: 57.5,
      baseSilo: 91
    },
    beta: {
      name: 'Coop Beta',
      flock: 'Organic Heritage Free-Range',
      birds: '980 Birds',
      baseTemp: 22.8,
      baseHum: 61.0,
      baseSilo: 84
    },
    gamma: {
      name: 'Coop Gamma',
      flock: 'Precision Brooder Chamber',
      birds: '1,640 Birds',
      baseTemp: 24.1,
      baseHum: 55.0,
      baseSilo: 94
    }
  }

  // Slight natural live fluctuation
  useEffect(() => {
    const current = coops[activeCoop]
    const interval = setInterval(() => {
      setTelemetryValues({
        temp: +(current.baseTemp + (Math.random() * 0.6 - 0.3)).toFixed(1),
        humidity: +(current.baseHum + (Math.random() * 1.2 - 0.6)).toFixed(1),
        silo: Math.min(100, Math.max(70, Math.round(current.baseSilo + (Math.random() * 2 - 1)))),
        energy: Math.min(100, Math.max(88, Math.round(96 + (Math.random() * 2 - 1)))),
        aqi: +(99.3 + Math.random() * 0.4).toFixed(1),
        health: +(99.7 + Math.random() * 0.2).toFixed(1)
      })
    }, 3500)

    return () => clearInterval(interval)
  }, [activeCoop])

  const handleCalibrate = () => {
    setIsCalibrating(true)
    setTimeout(() => {
      setIsCalibrating(false)
    }, 800)
  }

  const selected = coops[activeCoop]

  return (
    <section className="telemetry-section" id="telemetry">
      <div className="telemetry-inner">
        <div className="telemetry-header reveal visible">
          <span className="telemetry-eyebrow">
            <i className="fa-solid fa-satellite-dish"></i> 24/7 IOT COOP TELEMETRY
          </span>
          <h2 className="telemetry-title">
            Smart Precision Farming. <br />
            <span className="telemetry-title-highlight">Monitored in Real-Time.</span>
          </h2>
          <p className="telemetry-desc">
            Every AL Rehman poultry habitat is powered by automated IoT environmental sensors, climate stabilizers, and AI flock wellness monitors to ensure peak daily egg yield.
          </p>
        </div>

        <div className="telemetry-board reveal visible">
          {/* Top Bar Controls */}
          <div className="telemetry-topbar">
            <div className="telemetry-coop-tabs">
              {Object.keys(coops).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`telemetry-tab-btn ${activeCoop === key ? 'active' : ''}`}
                  onClick={() => setActiveCoop(key)}
                >
                  <i className="fa-solid fa-house-chimney-window"></i>
                  {coops[key].name}
                </button>
              ))}
            </div>

            <div className="telemetry-mode-toggle">
              <span className="telemetry-pill-status">
                <span className="sim-live-pulse-dot" style={{ background: '#4ade80' }}></span>
                {selected.flock} · {selected.birds}
              </span>

              <button
                type="button"
                className="telemetry-mode-btn"
                onClick={() => setIsNightMode(!isNightMode)}
                title="Toggle daylight simulation cycle"
              >
                <i className={`fa-solid ${isNightMode ? 'fa-moon text-indigo-400' : 'fa-sun text-amber-400'}`}></i>
                {isNightMode ? 'Night Warm' : 'Daylight Cycle'}
              </button>

              <button
                type="button"
                className="telemetry-mode-btn"
                onClick={handleCalibrate}
                title="Recalibrate live sensor stream"
              >
                <i className={`fa-solid fa-arrows-rotate ${isCalibrating ? 'fa-spin text-lime' : ''}`}></i>
                {isCalibrating ? 'Calibrating...' : 'Sync IoT'}
              </button>
            </div>
          </div>

          {/* 6 High-Tech Sensor Gauges Grid */}
          <div className="telemetry-grid">
            {/* Gauge 1: Temperature */}
            <div className="telemetry-gauge-card">
              <div className="gauge-head">
                <div className="gauge-icon-wrap">
                  <i className="fa-solid fa-temperature-half"></i>
                </div>
                <span className="gauge-pill-badge">Optimal 22-25°C</span>
              </div>
              <div className="gauge-value-row">
                <span className="gauge-val-big">{telemetryValues.temp}</span>
                <span className="gauge-val-unit">°C</span>
              </div>
              <div className="gauge-label">Coop Ambient Temperature</div>
              <div className="gauge-progress-track">
                <div
                  className="gauge-progress-bar"
                  style={{ width: `${(telemetryValues.temp / 35) * 100}%`, background: 'linear-gradient(90deg, #22c55e, #c9f36a)' }}
                ></div>
              </div>
              <div className="gauge-footer-note">
                <span>Micro-climate HVAC</span>
                <span className="gauge-status-active"><i className="fa-solid fa-circle-check"></i> Stabilized</span>
              </div>
            </div>

            {/* Gauge 2: Humidity */}
            <div className="telemetry-gauge-card">
              <div className="gauge-head">
                <div className="gauge-icon-wrap" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)' }}>
                  <i className="fa-solid fa-droplet"></i>
                </div>
                <span className="gauge-pill-badge">Target 55-65%</span>
              </div>
              <div className="gauge-value-row">
                <span className="gauge-val-big">{telemetryValues.humidity}</span>
                <span className="gauge-val-unit">%</span>
              </div>
              <div className="gauge-label">Relative Atmospheric Humidity</div>
              <div className="gauge-progress-track">
                <div
                  className="gauge-progress-bar"
                  style={{ width: `${telemetryValues.humidity}%`, background: 'linear-gradient(90deg, #0284c7, #38bdf8)' }}
                ></div>
              </div>
              <div className="gauge-footer-note">
                <span>Automated Misting</span>
                <span className="gauge-status-active"><i className="fa-solid fa-circle-check"></i> Active</span>
              </div>
            </div>

            {/* Gauge 3: Bio-Grain Feed Silo */}
            <div className="telemetry-gauge-card">
              <div className="gauge-head">
                <div className="gauge-icon-wrap" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }}>
                  <i className="fa-solid fa-wheat-awn"></i>
                </div>
                <span className="gauge-pill-badge">Organic Feed</span>
              </div>
              <div className="gauge-value-row">
                <span className="gauge-val-big">{telemetryValues.silo}</span>
                <span className="gauge-val-unit">% Silo Fill</span>
              </div>
              <div className="gauge-label">Bio-Nutrient Feeder Reserve</div>
              <div className="gauge-progress-track">
                <div
                  className="gauge-progress-bar"
                  style={{ width: `${telemetryValues.silo}%`, background: 'linear-gradient(90deg, #d97706, #fbbf24)' }}
                ></div>
              </div>
              <div className="gauge-footer-note">
                <span>Auto Dispenser</span>
                <span className="gauge-status-active"><i className="fa-solid fa-circle-check"></i> Ready</span>
              </div>
            </div>

            {/* Gauge 4: Air Quality */}
            <div className="telemetry-gauge-card">
              <div className="gauge-head">
                <div className="gauge-icon-wrap" style={{ color: '#a78bfa', background: 'rgba(167, 139, 250, 0.12)' }}>
                  <i className="fa-solid fa-wind"></i>
                </div>
                <span className="gauge-pill-badge">HEPA Purified</span>
              </div>
              <div className="gauge-value-row">
                <span className="gauge-val-big">{telemetryValues.aqi}</span>
                <span className="gauge-val-unit">% Clean</span>
              </div>
              <div className="gauge-label">Air Purity &amp; Odor Control</div>
              <div className="gauge-progress-track">
                <div
                  className="gauge-progress-bar"
                  style={{ width: `${telemetryValues.aqi}%`, background: 'linear-gradient(90deg, #7c3aed, #c084fc)' }}
                ></div>
              </div>
              <div className="gauge-footer-note">
                <span>Multi-stage Fans</span>
                <span className="gauge-status-active"><i className="fa-solid fa-circle-check"></i> Clean</span>
              </div>
            </div>

            {/* Gauge 5: Solar & Grid Power */}
            <div className="telemetry-gauge-card">
              <div className="gauge-head">
                <div className="gauge-icon-wrap" style={{ color: '#eab308', background: 'rgba(234, 179, 8, 0.12)' }}>
                  <i className="fa-solid fa-solar-panel"></i>
                </div>
                <span className="gauge-pill-badge">Zero Outage</span>
              </div>
              <div className="gauge-value-row">
                <span className="gauge-val-big">{telemetryValues.energy}</span>
                <span className="gauge-val-unit">% Charged</span>
              </div>
              <div className="gauge-label">Solar &amp; Battery Backups</div>
              <div className="gauge-progress-track">
                <div
                  className="gauge-progress-bar"
                  style={{ width: `${telemetryValues.energy}%`, background: 'linear-gradient(90deg, #ca8a04, #facc15)' }}
                ></div>
              </div>
              <div className="gauge-footer-note">
                <span>24/7 Power Reserve</span>
                <span className="gauge-status-active"><i className="fa-solid fa-circle-check"></i> 100% Online</span>
              </div>
            </div>

            {/* Gauge 6: Flock Health Score */}
            <div className="telemetry-gauge-card">
              <div className="gauge-head">
                <div className="gauge-icon-wrap" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.12)' }}>
                  <i className="fa-solid fa-shield-heart"></i>
                </div>
                <span className="gauge-pill-badge">AI Vet Verified</span>
              </div>
              <div className="gauge-value-row">
                <span className="gauge-val-big">{telemetryValues.health}</span>
                <span className="gauge-val-unit">Grade-A</span>
              </div>
              <div className="gauge-label">Overall Flock Biosecurity</div>
              <div className="gauge-progress-track">
                <div
                  className="gauge-progress-bar"
                  style={{ width: `${telemetryValues.health}%`, background: 'linear-gradient(90deg, #16a34a, #86efac)' }}
                ></div>
              </div>
              <div className="gauge-footer-note">
                <span>Daily Health Audit</span>
                <span className="gauge-status-active"><i className="fa-solid fa-circle-check"></i> Exceptional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
