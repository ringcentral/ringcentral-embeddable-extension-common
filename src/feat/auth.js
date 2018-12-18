/**
 * auth related feature
 */

import {thirdPartyConfigs} from '../common/app-config'
import logo from '../common/rc-logo'
import {
  createElementFromHTML,
  findParentBySel
} from '../common/helpers'

let tokenHandler
let {
  serviceName
} = thirdPartyConfigs

/**
 * when user click close auth button or
 * user start auth process, hide auth button
 */
export function hideAuthBtn() {
  let dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.add('rc-hide-to-side')
}

/**
 * when user click contacts in ringcentral widgets or
 * try to get third party contacts,
 * need show auth button to user
 */
export function showAuthBtn() {
  let dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.remove('rc-hide-to-side')
}

/**
 * hanle user click auth button
 * @param {*} e
 */
function handleAuthClick(e) {
  let {target} = e
  let {classList}= target
  if (findParentBySel(target, '.rc-auth-btn')) {
    doAuth()
  } else if (classList.contains('rc-dismiss-auth')) {
    hideAuthBtn()
  }
}

/**
 * hide auth panel when auth end
 */
export function hideAuthPanel() {
  let frameWrap = document.getElementById('rc-auth-hs')
  frameWrap && frameWrap.classList.add('rc-hide-to-side')
}

/**
 * todo
 * do the auth here,
 * might need get apikey or maybe just do nothing
 */
export async function doAuth() {
  if (window.rc.local.apiToken) {
    return
  }
  hideAuthBtn()
  let frameWrap = document.getElementById('rc-auth-hs')
  frameWrap && frameWrap.classList.remove('rc-hide-to-side')
  //await do other auth work()
}

/**
 * notify ringcentral widgets about auth status
 * @param {} authorized
 */
export function notifyRCAuthed(authorized = true) {
  window.rc.postMessage({
    type: 'rc-adapter-update-authorization-status',
    authorized
  })
}

/**
 * when user click unauth button from ringcentral widgets
 */
export async function unAuth() {
  await window.rc.updateToken(null)
  clearTimeout(tokenHandler)
  notifyRCAuthed(false)
}

/**
 * render auth button
 * todo: you can customize this
 */
export function renderAuthButton() {
  let btn = createElementFromHTML(
    `
      <div class="rc-auth-button-wrap animate rc-hide-to-side">
        <span class="rc-auth-btn">
          <span class="rc-iblock">Auth</span>
          <img class="rc-iblock" src="${logo}" />
          <span class="rc-iblock">access ${serviceName} data</span>
        </span>
        <div class="rc-auth-desc rc-pd1t">
          After auth, you can access ${serviceName} contacts from RingCentral phone's contacts list. You can revoke access from RingCentral phone's setting.
        </div>
        <div class="rc-pd1t">
          <span class="rc-dismiss-auth" title="dismiss">&times;</span>
        </div>
      </div>
    `
  )
  btn.onclick = handleAuthClick
  if (
    !document.querySelector('.rc-auth-button-wrap')
  ) {
    document.body.appendChild(btn)
  }
}

/**
 * todo: you can customize this
 */
export function renderAuthPanel() {
  let pop = createElementFromHTML(
    `
    <div id="rc-auth-hs" class="animate rc-auth-wrap rc-hide-to-side" draggable="false">
      Authing...
    </div>
    `
  )
  if (
    !document.getElementById('rc-auth-hs')
  ) {
    document.body.appendChild(pop)
  }
}
