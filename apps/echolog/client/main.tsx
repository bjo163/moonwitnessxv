import { createRoot } from 'react-dom/client'
import '@moonwitness/moonui/moon.css'
import './echolog-layout.css'
import { App } from './App.js'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(<App />)
}
