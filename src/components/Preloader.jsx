import React, { useState, useEffect } from 'react'
import logoImg from '../assets/logo.webp'

export default function Preloader() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true)
      setTimeout(() => {
        setVisible(false)
      }, 600)
    }, 1800)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      id="vip-preloader"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#0d2c20',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: fading ? 0 : 1,
        transform: fading ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: fading ? 'none' : 'auto'
      }}
    >
      <div className="orbit-stage">
        <div className="orbit-ambient-glow"></div>
        <div className="orbit-ring-outer">
          <div className="orbit-stardust-dot dot-1"></div>
          <div className="orbit-stardust-dot dot-2"></div>
        </div>
        <div className="orbit-track-main"></div>
        <div
          className="preloader-float-bubble"
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '12px',
            boxShadow: '0 0 25px rgba(201, 243, 106, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'preloader-float-anim 2.5s ease-in-out infinite'
          }}
        >
          <img
            src={logoImg}
            alt="AL Rehman Meta Eggs Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#f8f7f0' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, letterSpacing: '1px' }}>
          AL REHMAN META EGGS
        </h2>
        <span style={{ fontSize: '12px', color: '#c9f36a', letterSpacing: '2px', textTransform: 'uppercase' }}>
          POULTRY &amp; FARM ECOSYSTEM
        </span>
      </div>
    </div>
  )
}
