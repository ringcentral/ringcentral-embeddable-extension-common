

import initThirdPartyApi from './third-party-api'
import insertClickToCall from '../feat/insert-click-to-call-button'
import addHoverEvent from '../feat/hover-to-show-call-button'
import convertPhoneLink from '../feat/make-phone-number-clickable'
import {
  popup
} from '../common/helpers'

function registerService(config) {

  // handle contacts sync feature
  initThirdPartyApi()

  // insert click-to-call button
  insertClickToCall(config)

  // add event handler to developer configed element, show click-to-dial tooltip to the elements
  addHoverEvent(config)

  // convert phonenumber text to click-to-dial link
  convertPhoneLink(config)

  // Listen message from background.js to open app window when user click icon.
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action === 'openAppWindow') {
        popup()
      }
      sendResponse('ok')
    }
  )
}

let registered = false

export default (config) => {
  // only when ringcentral widgets ready, start to init chrome extension logic
  return () => {
    window.addEventListener('message', function (e) {
      const data = e.data
      if (data && data.type === 'rc-adapter-pushAdapterState' && registered === false) {
        registered = true
        registerService(config)
      }
    })
  }
}
