import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './ThemeContext'
import { VoiceProvider } from './voice/VoiceContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <VoiceProvider>
          <App />
        </VoiceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
