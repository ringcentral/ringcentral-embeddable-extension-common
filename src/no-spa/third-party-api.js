/**
 * third party api
 * you can do things like:
 * 1. sync thirdparty contacts to ringcentral contact list
 * 2. when calling or call inbound, show caller/callee info panel
 * 3. sync call log to third party system
 *
 * document about third party features: https://github.com/ringcentral/ringcentral-embeddable/blob/master/docs/third-party-service-in-widget.md
 */

import {thirdPartyConfigs} from '../common/app-config'
import _ from 'lodash'
import {
  sendMsgToBackground
} from '../common/helpers'

let {
  serviceName
} = thirdPartyConfigs

window.rc = {
  postMessage: data => {
    sendMsgToBackground({
      to: 'standalone',
      data
    })
  }
}

export default async function initThirdPartyApi (config) {

  const {
    services,
    handleRCEvents
  } = config.thirdPartyServiceConfig(serviceName)

  window.addEventListener('message', (e) => {
    let {data} = e
    if (!data) {
      return
    }
    let {type} = data
    if (type === 'rc-adapter-pushAdapterState') {
      window.rc.postMessage({
        type: 'rc-adapter-register-third-party-service',
        service: services
      })
    }
  })

  // init
  window.addEventListener('message', handleRCEvents)

  config.initThirdParty()

}

