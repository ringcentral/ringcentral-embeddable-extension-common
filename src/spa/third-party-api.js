/**
 * third party api
 * you can do things like:
 * 1. sync third party contacts to ringcentral widgets contact list
 * 2. when call outbound or call inbound, show caller/callee info panel
 * 3. sync call log to third party system
 *
 * document about third party features: https://github.com/ringcentral/ringcentral-embeddable/blob/master/docs/third-party-service-in-widget.md
 *
 * finish all todos in
 *
 * src/chrome-extension/features/activities.js
 * src/chrome-extension/features/auth.js
 * src/chrome-extension/features/call-log-sync.js
 * src/chrome-extension/features/contacts.js
 * to make all third party feature work
 *
 */

import {thirdPartyConfigs} from '../common/app-config'
let {
  serviceName
} = thirdPartyConfigs

export default async function initThirdPartyApi (config) {

  const {
    services,
    handleRCEvents
  } = config.thirdPartyServiceConfig()

  window.rc.postMessage({
    type: 'rc-adapter-register-third-party-service',
    service: services
  })

  // init
  window.addEventListener('message', handleRCEvents)

  config.initThirdParty()

}

