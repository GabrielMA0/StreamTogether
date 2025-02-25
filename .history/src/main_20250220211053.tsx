import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import VideoPlayer from './Components/VideoPlayer'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VideoPlayer />
  </StrictMode>,
)
