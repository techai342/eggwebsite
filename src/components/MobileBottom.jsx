import React from 'react'

export default function MobileBottom() {
  return (
    <div className="mobile-bottom">
      <a
        href="#login"
        className="btn btn-dark"
        onClick={(e) => {
          e.preventDefault()
          alert('Login Modal / Page: Connect backend or auth service.')
        }}
      >
        <i className="fa-solid fa-arrow-right-to-bracket"></i> Login Now
      </a>
      <a
        href="#register"
        className="btn btn-lime"
        onClick={(e) => {
          e.preventDefault()
          alert('Registration Modal / Page: Connect backend or auth service.')
        }}
      >
        Register Now <i className="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  )
}
