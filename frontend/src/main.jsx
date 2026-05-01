import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#0f172a',
          border: '1px solid #1e293b',
          color: '#e2e8f0',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#052e2b',
          },
        },
        error: {
          iconTheme: {
            primary: '#f43f5e',
            secondary: '#3f0d18',
          },
        },
      }}
    />
    <App />
  </StrictMode>,
)
