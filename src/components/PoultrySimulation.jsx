import React, { useState, useEffect, useRef } from 'react'

export default function PoultrySimulation() {
  const [isBusy, setIsBusy] = useState(false)
  const [eggsInTray, setEggsInTray] = useState(1)
  const [lifetimeEggs, setLifetimeEggs] = useState(19)
  const [completedCartons, setCompletedCartons] = useState(3)
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [statusText, setStatusText] = useState('Resting in Roost')
  const [doorOpen, setDoorOpen] = useState(false)
  const [henClasses, setHenClasses] = useState('in-coop')
  const [rollingEggActive, setRollingEggActive] = useState(false)
  const [showStamp, setShowStamp] = useState(false)
  const [trayStatus, setTrayStatus] = useState('') // '', 'dispatching', 'incoming'

  const TRAY_CAPACITY = 6
  const ratePerEgg = 30

  const canvasRef = useRef(null)
  const isBusyRef = useRef(false)
  const speedRef = useRef(1)
  const eggsInTrayRef = useRef(1)
  const confettiRef = useRef([])

  useEffect(() => {
    isBusyRef.current = isBusy
  }, [isBusy])

  useEffect(() => {
    speedRef.current = speedMultiplier
  }, [speedMultiplier])

  useEffect(() => {
    eggsInTrayRef.current = eggsInTray
  }, [eggsInTray])

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms / speedRef.current))

  // Ambient Canvas Sparks & Confetti Engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      }
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 24; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 800),
        y: Math.random() * (canvas.height || 380),
        radius: Math.random() * 2 + 0.8,
        speedY: -Math.random() * 0.4 - 0.1,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.2
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Particles
      ctx.fillStyle = '#f59e0b'
      particles.forEach((p) => {
        p.y += p.speedY
        p.x += p.speedX
        if (p.y < 0) p.y = canvas.height
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Confetti
      const confetti = confettiRef.current
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i]
        c.x += c.vx
        c.y += c.vy
        c.vy += 0.32
        c.rotation += c.vRot
        c.life--

        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate((c.rotation * Math.PI) / 180)
        ctx.fillStyle = c.color
        ctx.globalAlpha = Math.max(0, c.life / 60)
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6)
        ctx.restore()

        if (c.life <= 0) {
          confetti.splice(i, 1)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const triggerConfetti = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const colors = ['#c9f36a', '#ffffff', '#ffd700', '#f59e0b', '#22c55e']
    const startX = canvas.width * 0.85
    const startY = canvas.height * 0.72
    for (let i = 0; i < 45; i++) {
      confettiRef.current.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 4,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 60,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10
      })
    }
  }

  // Laying Cycle
  const runLayingCycle = async () => {
    if (isBusyRef.current) return
    isBusyRef.current = true
    setIsBusy(true)

    try {
      // 1. Coop Door opens
      setStatusText('Opening Roost Door...')
      setDoorOpen(true)
      await sleep(550)

      // 2. Hen walks out
      setStatusText('Hen Emerging from Roost...')
      setHenClasses('at-nest walking')
      await sleep(2200)
      setHenClasses('at-nest')

      // 3. Hen settles
      setStatusText('Settling on Straw Nest...')
      setHenClasses('at-nest laying')
      await sleep(1500)

      // 4. Hen lays an egg!
      setStatusText('Fresh Grade-A Egg Laid! 🥚')
      setHenClasses('at-nest celebrating')

      // 5. Egg rolls down chute
      setRollingEggActive(true)
      await sleep(1150)
      setRollingEggActive(false)

      // 6. Egg lands in tray
      let currentEggs = eggsInTrayRef.current + 1
      setEggsInTray(currentEggs)
      setLifetimeEggs((prev) => prev + 1)
      await sleep(600)
      setHenClasses('at-nest')

      // 7. Check if full
      if (currentEggs >= TRAY_CAPACITY) {
        setStatusText('🎉 Tray Full! Sealing & Dispatching...')
        setShowStamp(true)
        triggerConfetti()
        await sleep(1800)

        // Dispatch full tray
        setTrayStatus('dispatching')
        await sleep(650)

        // Clear slots
        setEggsInTray(0)
        setCompletedCartons((prev) => prev + 1)
        setShowStamp(false)

        setTrayStatus('incoming')
        await sleep(50)
        setTrayStatus('')
        await sleep(600)
      }

      // 8. Hen returns
      setStatusText('Hen Returning to Roost...')
      setHenClasses('in-coop face-left walking')
      await sleep(2200)

      setHenClasses('in-coop')
      setStatusText('Resting in Roost')
      setDoorOpen(false)
      await sleep(800)
    } catch (err) {
      console.error(err)
    } finally {
      isBusyRef.current = false
      setIsBusy(false)
    }
  }

  // User-governed simulation: lays only when farmer clicks "Lay Egg Now"
  // Runaway automatic loop disabled to prevent uncontrolled egg accrual
  useEffect(() => {
    // Initial resting state on mount
    setStatusText('Resting in Roost')
    setDoorOpen(false)
    setHenClasses('in-coop')
  }, [])

  const currentBatchPKR = eggsInTray * ratePerEgg

  return (
    <section className="farm-sim-section" id="simulation">
      <div className="sim-inner">
        <div className="sim-header reveal visible">
          <span className="sim-eyebrow">
            <i className="fa-solid fa-microchip"></i> Real-Time Harvest Simulation
          </span>
          <h2 className="sim-title">Live Poultry Production Chamber</h2>
          <p className="sim-desc">
            Watch our automated smart coop in action: the hen emerges from her roost, lays fresh grade-A eggs, and rolls them into collection trays ready for market packaging.
          </p>
        </div>

        <div className="sim-card reveal visible">
          {/* Top Status & Controls Bar */}
          <div className="sim-ctrl-bar">
            <div className="sim-status-group">
              <span className="sim-status-pill">
                <span className="sim-live-pulse-dot"></span>
                <span id="sim-status-text">{statusText}</span>
              </span>
              <span className="sim-counter-pill">
                Tray Fill: <strong>{eggsInTray} / {TRAY_CAPACITY} Eggs</strong>
              </span>
            </div>

            <div className="sim-btn-group">
              <button
                type="button"
                className="sim-action-btn"
                onClick={runLayingCycle}
                disabled={isBusy}
              >
                <i className="fa-solid fa-egg"></i> Lay Egg Now
              </button>
              <button
                type="button"
                className="sim-action-btn secondary"
                onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2 : 1))}
                style={
                  speedMultiplier === 2
                    ? { color: '#c9f36a', borderColor: 'rgba(201, 243, 106, 0.6)' }
                    : {}
                }
              >
                <i className={`fa-solid fa-${speedMultiplier === 2 ? 'forward-fast' : 'forward'}`}></i>{' '}
                {speedMultiplier === 2 ? '2x Turbo' : '1x Speed'}
              </button>
            </div>
          </div>

          {/* 3D Interactive Viewport */}
          <div className="sim-viewport" id="sim-viewport-stage">
            <canvas ref={canvasRef} id="sim-canvas" width="1037" height="380"></canvas>

            {/* Barn Scenery Layers */}
            <div className="sim-barn-back"></div>
            <div className="sim-barn-floor"></div>
            <div className="sim-straw-bedding"></div>

            {/* Left: Wooden Coop / Cage (Penjra) */}
            <div className="sim-coop-wrap">
              <div className="sim-coop-roof">Penjra · Roost 01</div>
              <div className="sim-coop-body">
                <div className="sim-coop-mesh"></div>
                <div className="sim-coop-lantern"></div>
                <div className="sim-coop-straw-spill"></div>
                {/* Hinged Animated Door */}
                <div className={`sim-coop-door ${doorOpen ? 'open' : ''}`}>
                  <i className={`fa-solid fa-${doorOpen ? 'lock-open' : 'lock'} text-xs`}></i>
                </div>
              </div>
            </div>

            {/* Center: Nest Perch */}
            <div className="sim-nest-area">
              <div className="sim-spotlight-cone"></div>
              <div className="sim-nest-straw"></div>
            </div>

            {/* Center-Right: Egg Rolling Chute */}
            <div className="sim-chute-wrap">
              <div className="sim-chute-rail">
                <div className="sim-chute-groove"></div>
              </div>
              {/* Rolling Egg Entity */}
              <div className={`sim-rolling-egg ${rollingEggActive ? 'active' : ''}`}></div>
            </div>

            {/* Center: The 3D Procedural Vector Hen */}
            <div className={`sim-hen-actor ${henClasses}`}>
              <div className="sim-hen-shadow"></div>
              <div className="sim-hen-character">
                <svg viewBox="0 0 120 110" className="sim-hen-svg" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="henBodyGrad" cx="45%" cy="40%" r="55%">
                      <stop offset="0%" stopColor="#ea7a32" />
                      <stop offset="50%" stopColor="#b84d12" />
                      <stop offset="100%" stopColor="#732a03" />
                    </radialGradient>
                    <linearGradient id="henChestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbd38d" />
                      <stop offset="50%" stopColor="#e08434" />
                      <stop offset="100%" stopColor="#9c3b06" />
                    </linearGradient>
                    <linearGradient id="henWingGrad" x1="0%" y1="0%" x2="100%" y2="80%">
                      <stop offset="0%" stopColor="#d66823" />
                      <stop offset="60%" stopColor="#933709" />
                      <stop offset="100%" stopColor="#5a1e02" />
                    </linearGradient>
                    <linearGradient id="henCombGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff3b30" />
                      <stop offset="70%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </linearGradient>
                    <linearGradient id="henBeakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="60%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                    <linearGradient id="henTailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3d1402" />
                      <stop offset="50%" stopColor="#782905" />
                      <stop offset="100%" stopColor="#240c01" />
                    </linearGradient>
                  </defs>

                  {/* Tail Feathers */}
                  <g className="hen-tail-part">
                    <path d="M 28 50 C 12 35, 10 16, 20 10 C 26 22, 34 32, 40 44 Z" fill="url(#henTailGrad)" />
                    <path d="M 32 48 C 22 28, 22 10, 30 6 C 36 18, 42 30, 46 44 Z" fill="#4d1b04" />
                    <path d="M 36 50 C 30 30, 34 14, 42 12 C 45 24, 48 35, 50 48 Z" fill="#8f3508" />
                  </g>

                  {/* Back Leg */}
                  <g className="hen-leg leg-back">
                    <path d="M 52 75 L 50 94 L 43 96 M 50 94 L 56 96 M 50 94 L 50 98" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>

                  {/* Main Body */}
                  <path className="hen-body-shape" d="M 32 58 C 30 40, 50 36, 68 38 C 82 40, 94 48, 92 68 C 90 84, 70 88, 52 86 C 38 84, 32 74, 32 58 Z" fill="url(#henBodyGrad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />

                  {/* Chest / Breast Feathers */}
                  <path d="M 68 40 C 84 44, 93 54, 91 70 C 88 80, 76 86, 65 85 C 78 78, 80 58, 68 40 Z" fill="url(#henChestGrad)" opacity="0.9" />

                  {/* Front Leg */}
                  <g className="hen-leg leg-front">
                    <path d="M 64 76 L 66 94 L 59 96 M 66 94 L 72 96 M 66 94 L 67 98" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>

                  {/* Wing */}
                  <g className="hen-wing-part">
                    <path d="M 44 54 C 42 46, 56 46, 70 50 C 78 52, 78 62, 74 68 C 68 76, 52 74, 46 68 C 42 64, 44 58, 44 54 Z" fill="url(#henWingGrad)" stroke="#5a1e02" strokeWidth="1" />
                    <path d="M 50 64 C 58 68, 68 68, 72 63" stroke="#fbd38d" strokeWidth="1.2" fill="none" opacity="0.6" />
                    <path d="M 48 58 C 56 62, 66 62, 72 56" stroke="#fbd38d" strokeWidth="1.2" fill="none" opacity="0.6" />
                  </g>

                  {/* Head & Neck */}
                  <g className="hen-head-part">
                    <path d="M 68 42 C 70 30, 76 22, 85 20 C 95 18, 98 28, 96 38 C 94 45, 86 48, 76 46 Z" fill="url(#henBodyGrad)" />
                    <path d="M 78 22 C 86 20, 93 25, 92 34 C 88 38, 80 40, 74 34 Z" fill="url(#henChestGrad)" opacity="0.5" />
                    <path className="hen-comb" d="M 78 19 C 76 13, 80 9, 83 14 C 85 8, 91 7, 92 13 C 94 8, 99 9, 98 16 C 96 21, 88 22, 78 19 Z" fill="url(#henCombGrad)" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))" />
                    <path className="hen-wattle" d="M 97 32 C 100 34, 102 40, 99 43 C 96 45, 94 40, 95 34 Z" fill="url(#henCombGrad)" />
                    <path className="hen-beak" d="M 96 26 L 109 29 C 104 33, 98 34, 96 34 Z" fill="url(#henBeakGrad)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))" />
                    <g className="hen-eye-group">
                      <circle cx="89" cy="24" r="3.5" fill="#ffffff" />
                      <circle cx="89.5" cy="24" r="2.2" fill="#1e1e1e" />
                      <circle cx="90.2" cy="23.2" r="0.8" fill="#ffffff" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>

            {/* Right: Collection Tray (6 Slots) */}
            <div className={`sim-tray-wrap ${trayStatus}`} id="sim-tray-wrap">
              <div className={`sim-harvest-stamp ${showStamp ? 'show' : ''}`} id="sim-harvest-stamp">
                <i className="fa-solid fa-box-check"></i> TRAY PACKED &amp; SEALED!
              </div>
              <div className="sim-tray-box">
                <div className="sim-tray-badge">
                  <span><i className="fa-solid fa-boxes-packing text-lime"></i> Market Tray</span>
                  <span id="sim-tray-indicator" className={eggsInTray === TRAY_CAPACITY ? 'full' : ''}>
                    {eggsInTray} / {TRAY_CAPACITY}
                  </span>
                </div>
                <div className="sim-slots-grid" id="sim-slots-grid">
                  {[...Array(TRAY_CAPACITY)].map((_, i) => (
                    <div
                      key={i}
                      className={`sim-slot-cup ${i < eggsInTray ? 'filled' : ''}`}
                      data-slot={i}
                    >
                      {i < eggsInTray && (
                        <div className="sim-tray-egg" title="Fresh Harvested Egg"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Stats Strip */}
          <div className="sim-footer-stats">
            <div className="sim-stat-box">
              <div className="sim-stat-key">Current Batch Value</div>
              <div className="sim-stat-val highlight" id="sim-live-val">
                Rs. {currentBatchPKR.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="sim-stat-box">
              <div className="sim-stat-key">Completed Cartons</div>
              <div className="sim-stat-val" id="sim-total-boxes">
                {completedCartons} Trays
              </div>
            </div>
            <div className="sim-stat-box">
              <div className="sim-stat-key">Total Produced</div>
              <div className="sim-stat-val" id="sim-total-laid">
                {lifetimeEggs} Eggs
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
