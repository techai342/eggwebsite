import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { FarmProvider } from './context/FarmContext'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './farm.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <FarmProvider>
        <App />
      </FarmProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

