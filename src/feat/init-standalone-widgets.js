/**
 * since it is not a single page app,
 * so we do not want to init widgets every time when url change
 * instead we add a button to wake the standalone widgets in single page
 * hide the button when widget window active
 */

import {
  createElementFromHTML,
  createCallBtnHtml,
  addRuntimeEventListener,
  popupBg,
  isIframe
} from '../common/helpers'

function onClickInitExt() {
  popupBg()
}

function toggleInitButton(
  btn = document.getElementById('rc-init-ext-wrap'),
  widgetsFocused
) {
  if (!btn) {
    return
  }
  if (widgetsFocused) {
    btn.classList.remove('rc-show-init')
  } else {
    btn.classList.add('rc-show-init')
  }
}

function initButton() {
  let widgetsFocused = false
  let dom = createElementFromHTML(
    `<div class="rc-init-ext-wrap animate" id="rc-init-ext-wrap">
      ${createCallBtnHtml('rc-init-ext')}
     </div>
    `
  )
  dom.onclick = onClickInitExt
  let btn = document.getElementById('rc-init-ext-wrap')
  if (!btn) {
    document.body.appendChild(dom)
    btn = dom
  }
  toggleInitButton(btn, widgetsFocused)
}

export default async (config) => {
  if (isIframe) {
    return
  }
  if (config.initCallButton !== false) {
    initButton()
  }
  addRuntimeEventListener(
    function(request, sender, sendResponse) {
      if (request.action === 'widgets-window-state-notify') {
        toggleInitButton(undefined, request.widgetsFocused)
      } else {
        window.postMessage(request, '*')
      }
      sendResponse()
    }
  )
}
