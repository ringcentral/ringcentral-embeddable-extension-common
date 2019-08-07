/**
 * upgrade notification module
 */

import { thirdPartyConfigs, appVersion } from '../common/app-config'
import extLinkSvg from '../common/link-external.svg'
import logo from '../icons/rc16.png'
import fetchBg from '../common/fetch-with-background'
import {
  createElementFromHTML
} from '../common/helpers'
import './upgrade-notification.styl'

const {
  upgradeServer,
  appName
} = thirdPartyConfigs

const keySkipVersions = `${appName}_skip_versions`
/**
 * version compare
 * @param {string} a
 * @param {string} b
 * @return {number}
 */
// compare version '1.0.0' '12.0.3'
// return 1 when a > b
// return -1 when a < b
// return 0 when a === b
function compare (a, b) {
  const ar = a.split('.').map(n => Number(n.replace('v', '')))
  const br = b.split('.').map(n => Number(n.replace('v', '')))
  let res = 0
  for (let i = 0, len = br.length; i < len; i++) {
    if (br[i] < ar[i]) {
      res = 1
      break
    } else if (br[i] > ar[i]) {
      res = -1
      break
    }
  }
  return res
}

function skipVersion (ver) {
  window.localStorage.setItem(keySkipVersions, ver)
}

export async function upgrade () {
  if (!upgradeServer) {
    return
  }
  let url = `${upgradeServer}?name=${appName}`
  let res = await fetchBg(url, {})
  if (!res || res.id !== appName) {
    return
  }
  let { version } = res
  let com = compare(version, appVersion)
  if (com <= 0) {
    return
  }
  if (window.localStorage.getItem(keySkipVersions) === version) {
    return
  }
  let upDom = document.getElementById('rc-upgrade-dom')
  if (upDom) {
    return
  }
  let body = res.data.release.body
    ? res.data.release.body.split(/\r/g)
      .filter(d => d.trim())
      .map(d => `<p>${d}</p>`).join('')
    : ''
  upDom = createElementFromHTML(`
    <div id="rc-upgrade-dom" class="rc-upgrade-dom">
      <h4>
        <img src="${logo}" width=16 height=16 class="rc-iblock rc-mg1r" />
        <b class="rc-iblock">New version released: ${version}</b>
      </h4>
      ${body}
      <p>
        <a href="${res.data.release.html_url}" target="_blank">
          <img src="${extLinkSvg}" width=16 height=16 class="rc-iblock rc-mg1r" />
          <b class="rc-iblock">Download now!</b>
        </a>
      </p>
      <p class="rc-pd2t up-btns-wrap">
        <span class="rc-skip-upgrade" title="Skip this version">Skip this version</span>
        <span class="rc-dismiss-upgrade" title="dismiss">&times;</span>
      <p>
    </div>
  `)
  function handleCloseUpgrade (e) {
    let { target } = e
    let { classList } = target
    if (classList.contains('rc-dismiss-upgrade')) {
      let d = document.getElementById('rc-upgrade-dom')
      d && d.remove()
    } else if (classList.contains('rc-skip-upgrade')) {
      let d = document.getElementById('rc-upgrade-dom')
      d && d.remove()
      skipVersion(version)
    }
  }
  upDom.onclick = handleCloseUpgrade
  document.body.appendChild(upDom)
}
