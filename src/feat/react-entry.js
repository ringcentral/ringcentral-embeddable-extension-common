/**
 * react module to handle dom functions
 */

import App from './react-app.js'
import { initReactApp } from '../lib/react-render.js'
import { envs } from '../lib/env.js'
import { actions } from '../lib/constants.js'
import { postMessage } from '../lib/actions.js'

function initApp (config) {
  console.log('init app')
  const id = 'rc-react-entry-main'
  initReactApp(
    App, config, id
  )
}

const defaultConfig = {
  // event handlers
  onCheckHistory: null, // params: sessionIds
  onLoginChange: null, // params: logined
  onCallEnd: null,
  onCountryCodeChange: null,
  onRing: null,
  searchPhone: null,
  onSyncEvent: null,
  findMatchCallLog: null,
  handleWidgetEvent: null,
  onTriggerLogin: null,
  onLoginCallback: null,
  onWidgetInited: null,

  // action handler
  onCall: null,
  onSMS: null,
  onClickRcIcon: null,
  onMeeting: null,
  onWebinar: null,
  tooltipConfigs: [],
  /**
  [
    {
      shouldAct: () => {
        return /\/deal\/\d+/.test(window.location.href)
      },
      selector: '[data-test="activity-note"] b'
    }
  ] */

  // widget settings
  widgetSetting: {
    name: '',
    contactMatchPath: '/contacts/match',
    callLoggerPath: '/callLogger',
    callLoggerTitle: 'Log Call',
    messageLoggerPath: '/messageLogger',
    messageLoggerTitle: 'Log SMS'
  },

  // check https://hhpjolgwy8.execute-api.us-east-1.amazonaws.com/prod/app for all params
  widgetParams: {
    appVersion: '',
    zIndex: 9999,
    prefix: '',
    newAdapterUI: 1,
    userAgent: '',
    disableActiveCallControl: false,
    appKey: '',
    appSecret: '',
    appServer: ''
  }
}

function buildQuery (q) {
  const keys = Object.keys(q)
  console.log('keys', keys)
  return keys.reduce((p, k, i) => {
    const fix = i ? '&' : '?'
    return p + fix + k + '=' + encodeURIComponent(q[k])
  }, '')
}

export function createRcExtApp (config = defaultConfig) {
  console.debug('app config', config)
  const {
    widgetParams
  } = config
  let appConfigQuery = ''
  if (widgetParams.clientID || widgetParams.appServer) {
    appConfigQuery = buildQuery(widgetParams)
  }
  /* eslint-disable-next-line */
  ;(function() {
    console.log(`import ${envs.name} v${envs.appVersion} to web page`)
    const rcs = document.createElement('script')
    rcs.src = chrome.runtime.getURL('embeddable/adapter.js') + appConfigQuery
    const rcs0 = document.getElementsByTagName('script')[0]
    rcs0.parentNode.insertBefore(rcs, rcs0)
  })()

  initApp(config)
}

/**
 * update rc/phone/sms/meeting/webinar icons show/hide/loading state
 * @param {object} update
 * default state = {
    phones: [],
    showRc: false,
    showCall: false,
    showSMS: false,
    showMeeting: false,
    showWebinar: false,
    loading: false,
    loadingPhones: false,
    loadingTip: ''
 * }
 */
export function updateIconState (update) {
  postMessage({
    action: actions.updateRcMainState
  })
}
