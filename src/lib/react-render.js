import { createElementFromHTML } from '../lib/dom.js'
import { render } from 'react-dom'
import { uid } from './uid.js'

export function initReactApp (
  App,
  props = {},
  id = 'rc-app-' + uid()
) {
  let rootElement = document.getElementById(id)
  if (rootElement) {
    return
  }
  rootElement = createElementFromHTML(`<div id="${id}"></div>`)
  const home = document.body
  home.appendChild(rootElement)
  render(
    <App {...props} />,
    rootElement
  )
}
