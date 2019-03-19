import {parsePhoneNumberFromString} from 'libphonenumber-js'
import _ from 'lodash'
import {callIconSvg, smsIconSvg, rcIconSvg} from './rc-icons'

export const RCBTNCLS = 'call-with-ringccentral-btn'
export const RCBTNCLS2 = 'call-with-rc-btn'
export const RCTOOLTIPCLS = 'rc-tooltip'
export const RCLOADINGCLS = 'rc-loading-wrap'
export const APIKEYLS = 'third-party-api-token'
export const lsKeys = {
  apiKeyLSKey: APIKEYLS
}
export const host = getHost()
export const isIframe = inIframe ()

const phoneFormat = 'US'

function inIframe () {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

function getHost() {
  let {host, protocol} = location
  return `${protocol}//${host}`
}

export function formatPhone(phone, country = phoneFormat) {
  let res = parsePhoneNumberFromString(phone, country)
  return res ? res.formatInternational() : phone
}

let msgHandler1
let msgHandler2
export function notify(msg, type = 'info', timer = 5000) {
  clearTimeout(msgHandler1)
  clearTimeout(msgHandler2)
  let wrap = document.getElementById('rc-msg-wrap')
  if (wrap) {
    wrap.remove()
  }
  wrap = createElementFromHTML(
    `
      <div class="rc-msg-wrap animate rc-msg-type-${type}" id="rc-msg-wrap">
        ${msg}
      </div>
    `
  )
  document.body.appendChild(wrap)
  msgHandler1 = setTimeout(() => {
    wrap.classList.add('rc-msg-enter')
  }, 200)
  msgHandler2 = setTimeout(() => {
    wrap.classList.remove('rc-msg-enter')
  }, timer)
}

export function checkPhoneNumber(phone, country = 'US') {
  return parsePhoneNumberFromString(phone, country)
}

export function createElementFromHTML(htmlString) {
  var div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstChild
}

export function sendMsgToRCIframe(data) {
  if (isIframe) {
    return window.top.postMessage({
      type: 'rc-message-proxy',
      data
    }, '*')
  }
  let dom = document.querySelector('#rc-widget-adapter-frame')
  dom && dom.contentWindow.postMessage(data, '*')
}

export function popup() {
  if (window._rc_is_no_spa) {
    return popupBg()
  }
  sendMsgToRCIframe({
    type: 'rc-adapter-syncMinimized',
    minimized: false
  })
  window.top.postMessage({
    type: 'rc-adapter-syncMinimized',
    minimized: false
  }, '*')
}


export function smsWithRingCentral(phoneNumber, text = '') {
  if (window._rc_is_no_spa) {
    return smsWithRingCentralBg(phoneNumber, text)
  }
  popup()
  sendMsgToRCIframe({
    type: 'rc-adapter-new-sms',
    phoneNumber,
    text
  })
}

export function callWithRingCentral(phoneNumber, callAtOnce = true) {
  if (window._rc_is_no_spa) {
    return callWithRingCentralBg(phoneNumber, callAtOnce)
  }
  popup()
  sendMsgToRCIframe({
    type: 'rc-adapter-new-call',
    phoneNumber,
    toCall: callAtOnce
  })
}

let events = []
setInterval(() => {
  events.forEach(ev => {
    if (ev.checker(window.location.href)) {
      ev.callback()
    }
  })
}, 1000)

export function dirtyLoop(checker, callback) {
  events.push({
    checker, callback
  })
}

/**
 * find the target parentNode
 * @param {Node} node
 * @param {String} className
 * @return {Boolean}
 */
export function findParentBySel(node, sel) {
  if (!node) {
    return false
  }
  let parent = node
  if (!parent || !parent.matches) {
    return false
  }
  if (parent.matches(sel)) {
    return parent
  }
  let res = false
  while (parent !== document.body) {
    parent = parent.parentNode
    if (!parent || !parent.matches) {
      break
    }
    if (parent.matches(sel)) {
      res = parent
      break
    }
  }
  return res
}

export function createPhoneList(phoneNumbers, cls = 'rc-call-dds') {
  if (!phoneNumbers || phoneNumbers.length < 2) {
    return ''
  }
  let dds = phoneNumbers.reduce((prev, obj) => {
    let {
      number,
      title
    } = obj
    return prev +
    `
    <div class="rc-call-dd">
      <span>${title}:</span>
      <b>${number}</b>
    </div>
    `
  }, '')
  return `
  <div class="${cls}">
    ${dds}
  </div>
  `
}

export const createCallBtnHtml = (
  cls = '',
  phoneNumbers = []
) => {
  let cls2 = phoneNumbers && phoneNumbers.length > 1
    ? 'rc-has-dd'
    : ''
  return `
    <span class="${RCBTNCLS} rc-mg1r ${cls} ${cls2}">
      <div class="rc-widget-c2d-logo">
        ${rcIconSvg()}
      </div>
      <div class="rc-widget-action-icon rc-widget-c2d-icon" title="Call with RingCentral">
        ${callIconSvg()}
      </div>
      <div class="rc-widget-c2d-separator-line"></div>
      <div class="rc-widget-action-icon rc-widget-c2sms-icon" title="SMS with RingCentral">
        ${smsIconSvg()}
      </div>
      ${createPhoneList(phoneNumbers)}
    </span>
  `
}

export function onClickPhoneNumber(e, sms = false) {
  let {target} = e
  let p = findParentBySel(target, '.rc-call-dd')
  if (!p) {
    return
  }
  let n = p.querySelector('b').textContent.trim()
  if (sms) {
    smsWithRingCentral(n)
  } else {
    callWithRingCentral(n)
  }
}

/**
 * register event handler which will auto destroy after fisrt run
 */
export function once(requestId, callback) {
  let func = e => {
    if (
      e.data &&
      e.data.requestId &&
      e.data.requestId === requestId
    ) {
      window.removeEventListener('message', func)
      callback(e.data)
    }
  }
  window.addEventListener('message', func)
}

export function addRuntimeEventListener(cb) {
  chrome.runtime.onMessage.addListener(cb)
}

export async function sendMsgToBackground(msg) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(msg, resolve)
  })
}

export function popupBg() {
  return sendMsgToBackground({
    action: 'popup'
  })
}

export function callWithRingCentralBg(phoneNumber, callAtOnce = true) {
  popup()
  sendMsgToBackground({
    to: 'standalone',
    data: {
      type: 'rc-adapter-new-call',
      phoneNumber,
      toCall: callAtOnce
    }
  })
}

export function smsWithRingCentralBg(phoneNumber, text) {
  popup()
  sendMsgToBackground({
    to: 'standalone',
    data: {
      type: 'rc-adapter-new-sms',
      phoneNumber,
      text
    }
  })
}

