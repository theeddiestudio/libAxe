import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BooksProvider } from './context/BooksContext.jsx'
import { RequestsProvider } from './context/RequestsContext.jsx'
import { LoansProvider } from './context/LoansContext.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BooksProvider>
          <RequestsProvider>
            <LoansProvider>
              <NotificationsProvider>
                <Toaster />
                <App />
              </NotificationsProvider>
            </LoansProvider>
          </RequestsProvider>
        </BooksProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
