/**
 * make phone number text to tel link and click-to-dial
 * config proper selector in './config.js', it will be done
 * but still, you can add custom behaviors if the config does not meet your needs
 */

import {
  dirtyLoop,
  createElementFromHTML,
  checkPhoneNumber,
  callWithRingCentral
} from '../common/helpers'

class LinkHandler {
  constructor(config) {
    this.config = config
    let {
      urlCheck
    } = this.config
    dirtyLoop(
      urlCheck,
      this.convertLinks,
      this.tryRMEvents
    )
  }

  convertLinks = () => {
    let {href} = location
    if (!this.config.urlCheck(href)) {
      return
    }
    let {selector} = this.config
    document
      .querySelectorAll(selector)
      .forEach(this.handleText)
  }

  handleText = (node) => {
    if (node.querySelector('.rc-click-to-call') || node.classList.contains('rc-click-to-call')) {
      return
    }
    let txt = (node.textContent || '').trim()
    if (!checkPhoneNumber(txt)) {
      return
    }
    if (node.tagName === 'A') {
      node.classList.add('rc-click-to-call')
      node.onclick = e => {
        e.preventDefault()
        callWithRingCentral(txt)
      }
      return
    }
    while (node.firstChild) {
      node.removeChild(node.firstChild)
    }
    let elem = createElementFromHTML(
      `
      <a
        href="tel:${txt}"
        class="rc-click-to-call"
        title="click to call ${txt}"
      >${txt}</a>
      `
    )
    elem.onclick = e => {
      e.preventDefault()
      callWithRingCentral(txt)
    }
    node.appendChild(elem)
  }

}

function processLink(config) {
  return new LinkHandler(config)
}

export default (config) => {
  config.phoneNumberSelectors.forEach(processLink)
}
