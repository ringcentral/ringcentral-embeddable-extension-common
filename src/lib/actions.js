/**
 * click to call/sms/meeting/webinar actions
 */

import { envs } from './env.js'

export function postMessage (msg, origin = '*') {
  window.postMessage(msg, origin)
}

export function sendMsgToRCIframe (data, isEngageVoice = false) {
  const dom = document.querySelector(`#${envs.serviceName}-rc-adapter-frame`)
  dom && dom.contentWindow.postMessage(data, '*')
}

export function popup (minimized = false) {
  sendMsgToRCIframe({
    type: 'rc-adapter-syncMinimized',
    minimized
  })
}

export function smsWithRingCentral (_phoneNumber, text = '') {
  const phoneNumber = _phoneNumber.replace('ext.', '#')
  popup()
  sendMsgToRCIframe({
    type: 'rc-adapter-new-sms',
    phoneNumber,
    text,
    conversation: true
  })
}

export function meetingWithRingCentral () {
  popup()
  sendMsgToRCIframe({
    type: 'rc-adapter-navigate-to',
    path: '/meeting/schedule'
  })
}

export function callWithRingCentral (_phoneNumber, callAtOnce = true) {
  const phoneNumber = _phoneNumber.replace('ext.', '#')
  popup()
  const data = {
    type: 'rc-adapter-new-call',
    phoneNumber,
    toCall: callAtOnce
  }
  sendMsgToRCIframe(data)
}
