import React, { useEffect } from 'react'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import LivePayoutTicker from './components/LivePayoutTicker'
import About from './components/About'
import Plans from './components/Plans'
import FarmTelemetry from './components/FarmTelemetry'
import PoultrySimulation from './components/PoultrySimulation'
import Calculator from './components/Calculator'
import GoldenEggReward from './components/GoldenEggReward'
import HowItWorks from './components/HowItWorks'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import MobileBottom from './components/MobileBottom'
import './components/attractive-sections.css'

export default function App() {
  useEffect(() => {
    // Scroll reveal observer
    const revealItems = document.querySelectorAll('.reveal')
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.08 }
      )
      revealItems.forEach((item) => revealObserver.observe(item))
      return () => revealObserver.disconnect()
    } else {
      revealItems.forEach((item) => item.classList.add('visible'))
    }
  }, [])

  return (
    <div className="site-shell">
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <LivePayoutTicker />
        <About />
        <Plans />
        <FarmTelemetry />
        <PoultrySimulation />
        <Calculator />
        <GoldenEggReward />
        <HowItWorks />
        <FAQ />
      </main>
      <Footer />
      <MobileBottom />
    </div>
  )
}
