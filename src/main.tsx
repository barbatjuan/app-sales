import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Fuerza el modo dark en toda la app
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
