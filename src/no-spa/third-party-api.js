/**
 * third party api
 * you can do things like:
 * 1. sync thirdparty contacts to ringcentral contact list
 * 2. when calling or call inbound, show caller/callee info panel
 * 3. sync call log to third party system
 *
 * document about third party features: https://github.com/ringcentral/ringcentral-embeddable/blob/master/docs/third-party-service-in-widget.md
 */

import { thirdPartyConfigs } from '../common/app-config'
import {
  sendMsgToBackground
} from '../common/helpers'

let {
  serviceName
} = thirdPartyConfigs

export default async function initThirdPartyApi (config) {
  if (!config.thirdPartyServiceConfig) {
    return
  }
  let thirdPartyConfig = config.thirdPartyServiceConfig(serviceName)
  if (!thirdPartyConfig) {
    return
  }
  const {
    services,
    handleRCEvents
  } = thirdPartyConfig

  let inited = false

  window.addEventListener('message', (e) => {
    let { data } = e
    if (!data) {
      return
    }
    let { type } = data
    if (type === 'rc-standalone-init') {
      config.initThirdParty && config.initThirdParty()
      const postMessage = data => {
        sendMsgToBackground({
          to: 'standalone',
          data
        })
      }
      postMessage({
        type: 'rc-adapter-register-third-party-service',
        service: services
      })
    }
  })
  if (!inited) {
    inited = true
    window.addEventListener('message', handleRCEvents)
    config.initThirdParty && config.initThirdParty()
  }
}
