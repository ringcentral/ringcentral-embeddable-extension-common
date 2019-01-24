/**
 * by Embbnux Ji embbnux@embbnux.com
 */

import {findNumbers} from 'libphonenumber-js'
import './click-to-dial-inject.styl'
import {callIconSvg, smsIconSvg, rcIconSvg} from './rc-icons'
import {findParentBySel} from './helpers'

const NODE_TEYPE_EXCLUDES = ['STYLE', 'OPTION', 'SCRIPT', 'INPUT', 'TEXT', 'TEXTAREA']

function isTelLinkNode(node) {
  return node.tagName === 'A' && (node.matches('a[href^="tel:"]') || node.matches('a[href^="sms:"]'))
}

function getAllNumberNodes(rootNode, isTelNode = isTelLinkNode) {
  let numberNodes = []
  if (
    !rootNode
  ) {
    return numberNodes
  }
  // if (rootNode.nodeType === Node.TEXT_NODE) {
  //   if (rootNode.data && rootNode.data.replace(/[^\d]/g, '').length > 1) {
  //     numberNodes.push(rootNode)
  //   }
  //   return numberNodes
  // }
  if (isTelNode(rootNode)) {
    numberNodes.push(rootNode)
    return numberNodes
  }
  let node = rootNode.firstChild
  while (!!node) {
    /*if (node.nodeType === Node.TEXT_NODE) {
      if (node.data && node.data.replace(/[^\d]/g, '').length > 1) {
        numberNodes.push(node)
      }
    } else*/
    if (isTelNode(node)) {
      numberNodes.push(node)
    } else {
      numberNodes = numberNodes.concat(getAllNumberNodes(node, isTelNode))
    }
    node = node.nextSibling
  }
  return numberNodes
}

const RC_C2D_TAGNAME = 'RC-WIDGET-C2D'
const RC_C2D_ELEM_TAGNAME = 'RC-WIDGET-C2D-MENU'
const RC_C2D_ELEM_ATTRIBUTE = 'DATA_PHONE_NUMBER'
const RC_C2D_MENU_HEIGHT = 30

class ClickToDialInject {
  constructor({
    onSmsClick,
    onCallClick,
    isTelNode = isTelLinkNode,
    selector,
    getPhoneNumber
  }) {
    this.getPhoneNumber = getPhoneNumber
    this.selector = selector
    this._onSmsClick = onSmsClick
    this._onCallClick = onCallClick
    this.isTelNode = isTelNode
    this._elemObserver = null
    this._c2dMenuEl = null
    this._c2dNumberHover = false
    this._currentNumber = null
    this._initObserver()
    this._injectC2DMenu()
  }

  _initObserver = () => {
    const numberNodes = getAllNumberNodes(document.body, this.isTelNode)
    this._handlePhoneNumberNodes(numberNodes)
    this._elemObserver = new MutationObserver(mutations => {
      let addedNumberNodes = []
      let removedNodes = []
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          addedNumberNodes = addedNumberNodes.concat(getAllNumberNodes(node, this.isTelNode))
        })
        mutation.removedNodes.forEach((node) => {
          removedNodes = removedNodes.concat(getAllNumberNodes(node, this.isTelNode))
        })
      })
      this._handlePhoneNumberNodes(addedNumberNodes)
      this._removeC2Dhandler(removedNodes)
    })
    this._elemObserver.observe(document.body, { childList: true, subtree: true, characterData: true })
  }

  _handlePhoneNumberNodes = (nodes) => {

    nodes.forEach((node) => {
      const parentNode = node.parentNode
      if (parentNode && parentNode.tagName === RC_C2D_TAGNAME) {
        this._createHoverEventListener(parentNode)
        return
      }
      if (this.isTelNode(node)) {
        this._createHoverEventListener(node)
        return
      }
      if (!node.data) {
        return
      }
      const results = findNumbers(node.data, 'US', { v2: true })
      if (results.length === 0) {
        return
      }
      const result = results[0]
      const originPhoneNumber = node.data.slice(result.startsAt, result.endsAt)
      const newTextNode = node.splitText(result.startsAt)
      newTextNode.data = newTextNode.data.substr(result.endsAt - result.startsAt)
      const el = document.createElement(RC_C2D_TAGNAME)
      el.textContent = originPhoneNumber
      el.setAttribute(RC_C2D_ELEM_ATTRIBUTE, result.number.number)
      parentNode.insertBefore(el, node.nextSibling)
      this._handlePhoneNumberNodes([newTextNode]) // next handle loop
    })
  }

  _removeC2Dhandler = (nodes) => {
    nodes.forEach((node) => {
      const parentNode = node.parentNode
      if (parentNode && parentNode.tagName === RC_C2D_TAGNAME) {
        this._cleanHoverEventListener(parentNode)
      }
      if (this.isTelNode(node)) {
        this._cleanHoverEventListener(node)
      }
    })
  }

  _cleanHoverEventListener = (node) => {
    node.removeEventListener(
      'mouseenter',
      this._onC2DNumberMouseEnter
    )
    node.removeEventListener(
      'mouseleave',
      this._onC2DNumberMouseLeave
    )
  }

  _createHoverEventListener = (node) => {
    this._cleanHoverEventListener(node)
    node.addEventListener(
      'mouseenter',
      this._onC2DNumberMouseEnter
    )
    node.addEventListener(
      'mouseleave',
      this._onC2DNumberMouseLeave
    )
  }

  c2smsMenu = () => {
    return `<div class="rc-widget-c2d-separator-line"></div>
    <div class="rc-widget-action-icon rc-widget-c2sms-icon" title="SMS with RingCentral">
    ${smsIconSvg()}
  </div>`
  }

  _injectC2DMenu = () => {
    if (this._c2dMenuEl) {
      return
    }
    let c2smsMenu = this._onSmsClick ? this.c2smsMenu() : ''
    this._c2dMenuEl = document.createElement(RC_C2D_ELEM_TAGNAME)
    this._c2dMenuEl.innerHTML = `
      <div class="rc-widget-c2d-menu-wrapper">
        <div class="rc-widget-c2d-logo">
          ${rcIconSvg(RC_C2D_MENU_HEIGHT)}
        </div>
        <div class="rc-widget-action-icon rc-widget-c2d-icon" title="Call with RingCentral">
          ${callIconSvg()}
        </div>
        ${c2smsMenu}
      </div>
      <div class="rc-widget-c2d-arrow">
        <div class="rc-widget-c2d-inner-arrow"></div>
      </div>
    `
    this._c2dMenuEl.setAttribute('class', 'rc-widget-c2d-menu')
    this._c2dMenuEl.addEventListener('mouseenter', e =>
      this._onC2DMenuMouseEnter(e)
    )
    this._c2dMenuEl.addEventListener('mouseleave', e =>
      this._onC2DMenuMouseLeave(e)
    )
    this._callBtn = this._c2dMenuEl.querySelector('.rc-widget-c2d-icon')
    this._callBtn.addEventListener('click', () => this.onCallClick())

    this._smsBtn = this._c2dMenuEl.querySelector('.rc-widget-c2sms-icon')
    this._smsBtn && this._smsBtn.addEventListener('click', () => this.onSmsClick())
    document.body.appendChild(this._c2dMenuEl)
  }

  _onC2DNumberMouseEnter = (e) => {
    if (e.rcHandled) {
      return
    }
    e.rcHandled = true
    this._c2dNumberHover = true
    let el = findParentBySel(e.currentTarget, this.selector)
    this._currentNumber = this.getPhoneNumber(el)
    if (this._currentNumber) {
      const rect = e.currentTarget.getBoundingClientRect()
      this._c2dMenuEl.style.top = `${rect.top -
        (RC_C2D_MENU_HEIGHT - rect.bottom + rect.top) / 2}px`
      this._c2dMenuLeft = window.innerWidth - rect.right < 90
      if (this._c2dMenuLeft) {
        this._c2dMenuEl.style.left = 'auto'
        this._c2dMenuEl.style.right = `${window.innerWidth - rect.left}px`
      } else {
        this._c2dMenuEl.style.left = `${rect.right}px`
        this._c2dMenuEl.style.right = 'auto'
      }
      if (this._c2dMenuLeft) {
        this._c2dMenuEl.setAttribute('class', 'rc-widget-c2d-menu left')
      } else {
        this._c2dMenuEl.setAttribute('class', 'rc-widget-c2d-menu')
      }
      this._updateC2DMenuDisplay()
    }
  }

  _onC2DNumberMouseLeave = (e) => {
    if (e.rcHandled) {
      return
    }
    e.rcHandled = true
    this._c2dNumberHover = false
    this._updateC2DMenuDisplay()
  }

  _onC2DMenuMouseEnter = () => {
    this._c2dMenuHover = true
    this._updateC2DMenuDisplay()
  }

  _onC2DMenuMouseLeave = () => {
    this._c2dMenuHover = false
    this._updateC2DMenuDisplay()
  }

  _updateC2DMenuDisplay = () => {
    if (this._c2dMenuHover || this._c2dNumberHover) {
      this._c2dMenuEl.style.display = 'block'
      return
    }
    this._c2dMenuEl.style.display = 'none'
  }

  onCallClick = () => {
    this._onCallClick(this._currentNumber)
  }

  onSmsClick = () => {
    this._onSmsClick(this._currentNumber)
  }
}

export default ClickToDialInject