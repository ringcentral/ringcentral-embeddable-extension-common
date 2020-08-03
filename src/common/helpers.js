import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { callIconSvg, smsIconSvg, rcIconSvg, meetingIconSvg } from './rc-icons'
import { thirdPartyConfigs } from './app-config'
import _ from 'lodash'
export const RCBTNCLS = 'call-with-ringccentral-btn'
export const RCBTNCLS2 = 'call-with-rc-btn'
export const RCTOOLTIPCLS = 'rc-tooltip'
export const RCLOADINGCLS = 'rc-loading-wrap'
export const APIKEYLS = 'third-party-api-token'
export const lsKeys = {
  apiKeyLSKey: APIKEYLS
}
export const host = getHost()
export const isIframe = inIframe()

const phoneFormat = 'US'

function inIframe () {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

function getHost () {
  let { host, protocol } = window.location
  return `${protocol}//${host}`
}

export function formatPhone (
  phone = '',
  country = _.get(window, 'rc.countryCode') || phoneFormat,
  format = 'formatInternational'
) {
  let res = parsePhoneNumberFromString(phone.replace('*', '#'), country)
  return res ? res[format]() : phone
}

let msgHandler1
let msgHandler2
export function notify (msg, type = 'info', timer = 5000) {
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

export function checkPhoneNumber (
  phone = '',
  country = _.get(window, 'rc.countryCode') || phoneFormat
) {
  return parsePhoneNumberFromString(phone, country)
}

export function createElementFromHTML (htmlString) {
  var div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstChild
}

export function sendMsgToRCIframe (data, isEngageVoice = false) {
  if (isEngageVoice || window.is_engage_voice) {
    return sendMsgToRCIframeEngageVoice(data)
  }
  if (isIframe) {
    return window.top.postMessage({
      type: 'rc-message-proxy',
      data
    }, '*')
  }
  let dom = document.querySelector(`#${thirdPartyConfigs.serviceName}-rc-adapter-frame`)
  dom && dom.contentWindow.postMessage(data, '*')
}

function sendMsgToRCIframeEngageVoice (data) {
  if (isIframe) {
    return window.top.postMessage({
      type: 'rc-message-proxy',
      data
    }, '*')
  }
  let dom = document.querySelector(`#generic-engage-voice-widget iframe`)
  dom && dom.contentWindow.postMessage(data, '*')
}

export function popup (minimized = false) {
  if (window._rc_is_no_spa && !minimized) {
    return popupBg()
  }
  sendMsgToRCIframe({
    type: 'rc-adapter-syncMinimized',
    minimized
  })
  window.top.postMessage({
    type: 'rc-adapter-syncMinimized',
    minimized
  }, '*')
}

export function smsWithRingCentral (_phoneNumber, text = '') {
  const phoneNumber = _phoneNumber.replace('ext.', '#')
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

export function meetingWithRingCentral () {
  if (window._rc_is_no_spa) {
    return meetingWithRingCentralBg()
  }
  popup()
  sendMsgToRCIframe({
    type: 'rc-adapter-navigate-to',
    path: '/meeting/schedule'
  })
}

export function callWithRingCentral (_phoneNumber, callAtOnce = true) {
  const phoneNumber = _phoneNumber.replace('ext.', '#')
  if (window._rc_is_no_spa) {
    return callWithRingCentralBg(phoneNumber, callAtOnce)
  }
  popup()

  const data = window.is_engage_voice
    ? {
      type: 'MessageTransport-push',
      payload: {
        type: 'rc-ev-clickToDial',
        phoneNumber
      }
    } : {
      type: 'rc-adapter-new-call',
      phoneNumber,
      toCall: callAtOnce
    }
  console.log('calling', data)
  sendMsgToRCIframe(data, window.is_engage_voice)
}

export function dirtyLoop (checker, callback) {
  // Select the node that will be observed for mutations
  const targetNode = document.body

  // Options for the observer (which mutations to observe)
  const config = {
    attributes: false,
    childList: true,
    subtree: true
  }

  // Callback function to execute when mutations are observed
  const cb = function (mutationsList, observer) {
    if (checker(window.location.href)) {
      callback()
    }
  }

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(cb)

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config)
}

/**
 * find the target parentNode
 * @param {Node} node
 * @param {String} className
 * @return {Boolean}
 */
export function findParentBySel (node, sel) {
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

export function createPhoneList (phoneNumbers, cls = 'rc-call-dds') {
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
      <div class="rc-widget-c2d-separator-line"></div>
      <div class="rc-widget-action-icon rc-widget-c2meeting-icon" title="Schedule meeting with RingCentral">
        ${meetingIconSvg()}
      </div>
      ${createPhoneList(phoneNumbers)}
    </span>
  `
}

export function onClickPhoneNumber (e, sms = false) {
  let { target } = e
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
export function once (requestId, callback) {
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

export function addRuntimeEventListener (cb) {
  chrome.runtime.onMessage.addListener(cb)
}

export async function sendMsgToBackground (msg) {
  window.postMessage(msg)
  return new Promise(resolve => {
    chrome.runtime.sendMessage(msg, resolve)
  })
}

export function popupBg () {
  return sendMsgToBackground({
    action: 'popup'
  })
}

export function callWithRingCentralBg (phoneNumber, callAtOnce = true) {
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

export function smsWithRingCentralBg (phoneNumber, text) {
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

export function meetingWithRingCentralBg (phoneNumber, text) {
  popup()
  sendMsgToBackground({
    to: 'standalone',
    data: {
      type: 'rc-adapter-navigate-to',
      path: '/meeting/schedule'
    }
  })
}
