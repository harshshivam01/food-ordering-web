import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/cartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   
      <CartProvider>
        <App />
      </CartProvider>
   
  </StrictMode>,
)
