import React from 'react'

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Create an account",
      desc: "Register and access your account through the platform's normal sign-in process."
    },
    {
      num: "02",
      title: "Explore farm plans",
      desc: "Review the displayed plan price, daily units and contract duration before proceeding."
    },
    {
      num: "03",
      title: "Review your account",
      desc: "Use your account dashboard to review available features and applicable platform terms."
    }
  ]

  return (
    <section className="section" id="how-it-works">
      <div className="section-heading reveal visible">
        <span className="section-kicker">Simple navigation</span>
        <h2 className="section-title">Getting started is simple.</h2>
        <p className="section-description">
          Follow these steps to explore the platform and its available plans.
        </p>
      </div>

      <div className="process-grid">
        {steps.map((step, idx) => (
          <article key={idx} className="process-card reveal visible">
            <div className="process-num">{step.num}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
