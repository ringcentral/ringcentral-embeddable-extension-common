# ringcentral-embeddable-extension-common

RingCentral Embeddable Voice chrome extension common files.

## Use

Install

```bash
npm i -D -E ringcentral-embeddable-extension-common
```

In `content.js` for single page app

```js

/**
 * content.js for chrome extension
 */

import createApp from 'ringcentral-embeddable-extension-common/src/spa/init'
//import * as config from './config'
import {ringCentralConfigs} from 'ringcentral-embeddable-extension-common/src/common/app-config'
import 'ringcentral-embeddable-extension-common/src/spa/style.styl'
import './custom.styl'

let {
  clientID,
  appServer
} = ringCentralConfigs

let appConfigQuery = ''
if (clientID || appServer) {
  appConfigQuery = `?clientID=${clientID}&appServer=${encodeURIComponent(appServer)}`
}

/* eslint-disable-next-line */
;(function() {
  console.log('import RingCentral Embeddable Voice to web page')
  var rcs = document.createElement('script')
  rcs.src = 'https://ringcentral.github.io/ringcentral-embeddable/adapter.js' + appConfigQuery
  var rcs0 = document.getElementsByTagName('script')[0]
  rcs0.parentNode.insertBefore(rcs, rcs0)
})()

let config = {
  // config for insert click to call button, check ./config.js insertClickToCallButton  for detail
  insertClickToCallButton: [],

  // config for hover contact node to show click to dial tooltip, check ./config.js hoverShowClickToCallButton for detail
  hoverShowClickToCallButton: [],

  // config for modify phone number text to click-to-call link, check ./config.js phoneNumberSelectors for detail
  phoneNumberSelectors: [],

  // third party feature config, check ./config.js thirdPartyServiceConfig function for detail
  // should return
  /*
  {
    services: object,
    handleRCEvents: function
  }
  */
  thirdPartyServiceConfig: (serviceName) => console.log(serviceName),

  // after init callback function, can do some extra init here
  initThirdParty: () => null
}

window.addEventListener('load', createApp(config))


```

In `content.js` for not single page app

```js

/**
 * content.js for chrome extension
 */

import createApp from 'ringcentral-embeddable-extension-common/src/no-spa/init'
// import * as config from './config'
import 'ringcentral-embeddable-extension-common/src/no-spa/style.styl'
import './custom.styl'

let config = {
  // config for insert click to call button, check ./config.js insertClickToCallButton  for detail
  insertClickToCallButton: [],

  // config for hover contact node to show click to dial tooltip, check ./config.js hoverShowClickToCallButton for detail
  hoverShowClickToCallButton: [],

  // config for modify phone number text to click-to-call link, check ./config.js phoneNumberSelectors for detail
  phoneNumberSelectors: [],

  // third party feature config, check ./config.js thirdPartyServiceConfig function for detail
  // should return
  /*
  {
    services: object,
    handleRCEvents: function
  }
  */
  thirdPartyServiceConfig: (serviceName) => console.log(serviceName),

  // after init callback function, can do some extra init here
  initThirdParty: () => null,

  // init call with ringcenntral button at page bottom
  // enbaled by default, change to false to disable it
  initCallButton: true
}

window.addEventListener('load', createApp(config))


```

Built-in oauth support

```js
import getAuthCode from 'ringcentral-embeddable-extension-common/src/feat/browser-oauth'

async function auth() {
  let authCode = await getAuthCode(authUrl)
  // do something like get access code with auth code
}

```

## License

MIT
