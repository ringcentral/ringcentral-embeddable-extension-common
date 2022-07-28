/**
 * Listen message from background.js to open app window when user click icon.
 */
import { popup } from '../lib/actions.js'
import { isIframe } from '../lib/constants.js'

export function handleClickExtensionIcon () {
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
