import React from 'react'

export default function MobileBottom() {
  return (
    <div className="mobile-bottom">
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
    </div>
  )
}
