
import initThirdPartyApi from './third-party-api'
import insertClickToCall from '../feat/insert-click-to-call-button'
import addHoverEvent from '../feat/hover-to-show-call-button'
import convertPhoneLink from '../feat/make-phone-number-clickable'
import {
  popup, isIframe, sendMsgToRCIframe
} from '../common/helpers'

function registerService (config) {
  // handle contacts sync feature
  if (!isIframe) {
    initThirdPartyApi(config)
  }

  // insert click-to-call button
  insertClickToCall(config)

  // add event handler to developer configed element, show click-to-dial tooltip to the elements
  addHoverEvent(config)

  // convert phonenumber text to click-to-dial link
  convertPhoneLink(config)

  // Listen message from background.js to open app window when user click icon.
  if (!isIframe) {
    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
        if (request.action === 'openAppWindow') {
          popup()
        }
        sendResponse('ok')
      }
    )
  }
}

let registered = false

export default (config) => {
  // only when ringcentral widgets ready, start to init chrome extension logic
  return () => {
    window.addEventListener('message', function (e) {
      const data = e.data
      if (data && data.type === 'rc-message-proxy') {
        sendMsgToRCIframe(data.data)
      }
    })
    if (isIframe) {
      registered = true
      return registerService(config)
    }
    window.addEventListener('message', function (e) {
      const data = e.data
      if (
        data &&
        (data.type === 'rc-adapter-pushAdapterState' || data.type === 'rc-ev-pushAdapterState') &&
        registered === false
      ) {
        registered = true
        registerService(config)
      }
    })
  }
}
