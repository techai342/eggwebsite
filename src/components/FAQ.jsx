import React, { useState } from 'react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      q: "How can I get started?",
      a: "Create an account, review the enabled plans and read their prices and conditions before selecting a plan."
    },
    {
      q: "Why are some farm categories not showing?",
      a: "This page displays plans whose status is enabled in the hens table. A category without an enabled plan will not appear in the plan and calculator selections."
    },
    {
      q: "How does the calculator work?",
      a: "The calculator multiplies the selected plan's daily units by the quantity. It then applies the configured market rate to estimate a 30-day equivalent. Actual results may differ."
    },
    {
      q: "Where can I get support?",
      a: "Use the official support channel provided by the platform administrator. Check the channel details before sharing account information."
    }
  ]

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="section" id="faqs" style={{ paddingTop: 0 }}>
      <div className="section-heading reveal visible">
        <span className="section-kicker">Need help?</span>
        <h2 className="section-title">Frequently asked questions.</h2>
      </div>

      <div className="faq-list reveal visible">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx
          return (
            <details
              key={idx}
              className="faq-item"
              open={isOpen}
              onClick={(e) => {
                e.preventDefault()
                toggle(idx)
              }}
            >
              <summary>{faq.q}</summary>
              {isOpen && <div className="faq-answer">{faq.a}</div>}
            </details>
          )
        })}
      </div>
    </section>
  )
}
