
import initThirdPartyApi from './third-party-api'
import insertClickToCall from '../feat/insert-click-to-call-button'
import addHoverEvent from '../feat/hover-to-show-call-button'
import initStandaloneWidgets from '../feat/init-standalone-widgets'
import convertPhoneLink from '../feat/make-phone-number-clickable'
import {
  addRuntimeEventListener,
  once
} from '../common/helpers'

function registerService (config) {
  // initStandaloneWidgets button
  initStandaloneWidgets(config)

  // handle contacts sync feature
  initThirdPartyApi(config)

  // insert click-to-call button
  insertClickToCall(config)

  // add event handler to developer configed element, show click-to-dial tooltip to the elements
  addHoverEvent(config)

  // convert phonenumber text to click-to-dial link
  convertPhoneLink(config)
}

export default (config) => {
  window._rc_is_no_spa = true
  return () => {
    addRuntimeEventListener(
      async function (request, sender, sendResponse) {
        if (request.to === 'content') {
          let { requestId } = request.data
          if (requestId) {
            once(requestId, sendResponse)
          } else {
            sendResponse(Promise.resolve('ok'))
          }
          window.postMessage(request.data, '*')
        }
      }
    )
    registerService(config)
  }
}
