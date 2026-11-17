import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BooksProvider } from './context/BooksContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BooksProvider>
          <Toaster />
          <App />
        </BooksProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
