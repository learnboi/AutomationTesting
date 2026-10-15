import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './announcement.css'
import './auth-polish.css'
import './brand-palette.css'
import './readability.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

