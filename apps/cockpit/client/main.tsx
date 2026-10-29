import { createRoot } from 'react-dom/client'
import { MOON_EXPERIENCES } from '@moonwitness/moonui'
import '@moonwitness/moonui/moon.css'
import './cockpit-layout.css'
import { App } from './App.js'

const rootElement = document.getElementById('root')
if (rootElement) {
  const experience = MOON_EXPERIENCES.operator
  rootElement.dataset.experience = 'operator'
  rootElement.style.setProperty('--experience-measure', experience.measure)
  rootElement.style.setProperty('--experience-max-width', experience.maxWidth)
  rootElement.style.setProperty('--experience-density', experience.density)
  rootElement.style.setProperty('--experience-line-height', String(experience.lineHeight))
  rootElement.style.setProperty('--experience-heading-font', experience.fonts.heading)
  rootElement.style.setProperty('--experience-body-font', experience.fonts.body)
  rootElement.style.setProperty('--experience-code-font', experience.fonts.code)
  rootElement.style.setProperty('--experience-display-size', experience.typeScale.display)
  rootElement.style.setProperty('--experience-heading-size', experience.typeScale.heading)
  rootElement.style.setProperty('--experience-body-size', experience.typeScale.body)
  rootElement.style.setProperty('--experience-caption-size', experience.typeScale.caption)
  rootElement.style.setProperty('--experience-code-size', experience.typeScale.code)
  rootElement.style.setProperty('--experience-gutter', experience.space.gutter)
  rootElement.style.setProperty('--experience-section-gap', experience.space.section)
  rootElement.style.setProperty('--experience-inline-gap', experience.space.inline)
  createRoot(rootElement).render(<App />)
}
