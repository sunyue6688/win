import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@douyinfe/semi-ui/react19-adapter'  // Semi UI React 19 兼容
import './semi.min.css'    // Semi Design CSS
import './index.css'       // 自定义 CSS
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
