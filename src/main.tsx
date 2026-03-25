import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css'  // Tailwind CSS (使用 CSS Layer 控制优先级)
import './semi.min.css'  // Semi Design CSS
import './index.css'     // 自定义 CSS
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
