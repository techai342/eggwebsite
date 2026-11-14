import React from 'react'
import { useFarm } from '../context/FarmContext'

export default function MobileBottom() {
  const farm = useFarm();
  const user = farm?.user;

  return (
    <div className="mobile-bottom">
      {user?.isLoggedIn ? (
        <a
          href="#/dashboard"
          className="btn btn-lime"
          style={{ gridColumn: 'span 2' }}
          onClick={(e) => {
            e.preventDefault()
            if (typeof window !== 'undefined') {
              window.location.hash = '#/dashboard'
            }
          }}
        >
          <i className="fa-solid fa-gauge-high"></i> Open Farm Dashboard
        </a>
      ) : (
        <>
          <a
            href="#/login"
            className="btn btn-dark"
            onClick={(e) => {
              e.preventDefault()
              if (typeof window !== 'undefined') {
                window.location.hash = '#/login'
              }
            }}
          >
            <i className="fa-solid fa-arrow-right-to-bracket"></i> Login Now
          </a>
          <a
            href="#/login"
            className="btn btn-lime"
            onClick={(e) => {
              e.preventDefault()
              if (typeof window !== 'undefined') {
                window.location.hash = '#/login'
              }
            }}
          >
            Register Now <i className="fa-solid fa-arrow-right"></i>
          </a>
        </>
      )}
    </div>
  )
}
