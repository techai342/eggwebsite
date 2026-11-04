import React from 'react'

export default function LivePayoutTicker() {
  const tickerEvents = [
    { user: 'Tariq M.', city: 'Lahore', action: 'harvested', amount: '14 Fresh Eggs (Rs. 420)', time: '1m ago', icon: 'fa-egg' },
    { user: 'Zainab K.', city: 'Karachi', action: 'withdrew', amount: 'Rs. 5,200 via Easypaisa', time: '3m ago', icon: 'fa-money-bill-transfer' },
    { user: 'Haris B.', city: 'Rawalpindi', action: 'adopted', amount: 'AL Rehman Meta Eggs Pack', time: '5m ago', icon: 'fa-wheat-awn' },
    { user: 'Imran S.', city: 'Multan', action: 'harvested', amount: '25 Fresh Eggs (Rs. 750)', time: '7m ago', icon: 'fa-egg' },
    { user: 'Bilal A.', city: 'Faisalabad', action: 'cashed out', amount: 'Rs. 3,600 via JazzCash', time: '9m ago', icon: 'fa-bolt' },
    { user: 'Ayesha N.', city: 'Islamabad', action: 'harvested', amount: '10 Fresh Eggs (Rs. 300)', time: '12m ago', icon: 'fa-egg' },
    { user: 'Shahbaz Q.', city: 'Sialkot', action: 'withdrew', amount: 'Rs. 9,000 via Bank', time: '15m ago', icon: 'fa-building-columns' },
  ]

  // Duplicate for seamless infinite loop
  const list = [...tickerEvents, ...tickerEvents]

  return (
    <div className="ticker-section" aria-label="Real-Time Farm Activity Ticker">
      <div className="ticker-wrapper">
        <div className="ticker-badge-lead">
          <span className="ticker-live-dot"></span>
          <span>LIVE ACTIVITY</span>
        </div>

        <div className="ticker-track-scroller">
          {list.map((item, idx) => (
            <div key={idx} className="ticker-item">
              <i className={`fa-solid ${item.icon} text-lime`}></i>
              <span className="ticker-item-user">{item.user} ({item.city})</span>
              <span className="ticker-item-action">{item.action}</span>
              <span className="ticker-item-amount">{item.amount}</span>
              <span className="ticker-item-time">· {item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
