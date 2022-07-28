/**
 * render rc icon as click to open setting button
 * render click to call/sms/meeting/webinar button in contact page when have phone number
 */

import { useState, useEffect, useRef } from 'react'
import _ from 'lodash'
import Drag from 'react-draggable'
import {
  Tooltip,
  Popover,
  Button
} from 'antd'
import {
  RcIcon,
  CallIcon,
  SMSIcon,
  MeetingIcon,
  WebinarIcon
} from '../icons-ui/index.js'
import { upgrade } from './upgrade-notification.js'
import { postMessage } from '../lib/actions.js'
import * as ls from '../lib/ls.js'
import {
  actions
} from '../lib/constants.js'
import {
  Loading3QuartersOutlined,
  SettingFilled
} from '@ant-design/icons'
import './main.styl'

window._rc = {}
/**
 *
 * @param {*} props
 * @returns
 */
export function MainRcExtApp (props) {
  const registered = useRef(false)
  const [
    state,
    change
  ] = useState({
    phones: [],
    showRc: false,
    showCall: false,
    showSMS: false,
    showMeeting: false,
    showWebinar: false,
    loading: false,
    loadingPhones: false,
    loadingTip: ''
  })

  function setState (ext) {
    change(old => {
      return {
        ...old,
        ...ext
      }
    })
  }

  const {
    contactMatchPath,
    callLoggerPath,
    messageLoggerPath
  } = props.widgetSetting

  async function handleWidgetEvent (e) {
    const {
      data,
      type,
      loggedIn,
      path,
      telephonyStatus,
      ready,
      sessionIds,
      callbackUri,
      countryCode
    } = e.data || {}
    console.log('handleWidgetEvent', e.data)
    if (
      type === 'rc-route-changed-notify' &&
      path === '/history'
    ) {
      props.onCheckHistory && props.onCheckHistory(sessionIds)
    }
    if (type === 'rc-dialer-status-notify') {
      window._rc.dialerReady = ready
    } else if (type === 'rc-login-status-notify') {
      console.debug('rc logined', loggedIn)
      props.onLoginChange && props.onLoginChange(loggedIn)
      window._rc.loggedIn = loggedIn
    } else if (type === 'rc-call-end-notify') {
      props.onCallEnd && props.onCallEnd(e.data)
    } else if (
      type === 'rc-active-call-notify'
    ) {
      props.onCallEnd(e.data)
    } else if (type === 'rc-region-settings-notify') {
      const prevCountryCode = window._rc.countryCode || 'US'
      console.debug('prev country code:', prevCountryCode)
      const newCountryCode = countryCode
      console.debug('new country code:', newCountryCode)
      window._rc.countryCode = newCountryCode
      ls.set('rc-country-code', newCountryCode)
      props.onCountryCodeChange && props.onCountryCodeChange(newCountryCode)
    } else if (type === 'rc-adapter-syncPresence') {
      if (telephonyStatus === 'Ringing') {
        window._rc.calling = true
        props.onRing && props.onRing(e.data)
      } else if (telephonyStatus === 'NoCall') {
        if (window._rc.calling) {
          props.onCallEnd && props.onCallEnd(e.data)
        }
      }
    } else if (type === 'rc-login-popup-notify') {
      props.onTriggerLogin && props.onTriggerLogin()
    } else if (callbackUri && !type) {
      props.onLoginCallback && props.onLoginCallback({
        callbackUri
      })
    }

    if (type !== 'rc-post-message-request') {
      return false
    }
    if (path === contactMatchPath) {
      const phoneNumbers = _.get(data, 'body.phoneNumbers') || []
      const res = props.searchPhone(phoneNumbers)
        ? await props.searchPhone(phoneNumbers)
        : null
      postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: {
          data: res
        }
      })
    } else if (
      path === messageLoggerPath ||
      path === callLoggerPath
    ) {
      props.onSyncEvent && props.onSyncEvent({
        ...data.body,
        requestId: data.requestId
      })
    } else if (path === '/callLogger/match' || data.path === '/messageLogger/match') {
      const matchRes = props.findMatchCallLog
        ? await props.findMatchCallLog(data)
        : null
      postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: { data: matchRes }
      })
    }
  }

  function onEvent (e) {
    const {
      action,
      data,
      type
    } = e.data || {}
    console.log('onEvent', e.data)
    if (action === actions.updateRcMainState) {
      setState(data)
    } else if (
      type === 'rc-adapter-pushAdapterState' &&
      registered.current === false
    ) {
      console.log('registered')
      props.onWidgetInited && props.onWidgetInited()
      registered.current = true
      postMessage({
        type: 'rc-adapter-register-third-party-service',
        service: props.widgetSetting
      })
    }
    if (!registered.current) {
      console.log('not registered')
      return false
    }
    handleWidgetEvent(e)
    props.handleWidgetEvent && props.handleWidgetEvent(e)
  }

  function watch () {
    window.addEventListener('message', onEvent)
  }

  async function onCall (
    phone = state.phones[0]?.phoneNumber
  ) {
    if (!phone) {
      return
    }
    props.onCall(phone)
  }

  function onSMS (
    phone = state.phones[0]?.phoneNumber
  ) {
    if (!phone) {
      return
    }
    props.onSMS(phone)
  }

  function onClickRc () {
    return props.onClickRcIcon()
  }

  function renderPhoneList (func) {
    return (
      <div>
        {
          state.phones.map((p, i) => {
            const { phoneNumber, phoneType } = p
            return (
              <p key={i + 'phone-list'}>
                <Button
                  onClick={func(phoneNumber)}
                >
                  {phoneType}: {phoneNumber}
                </Button>
              </p>
            )
          })
        }
      </div>
    )
  }

  function renderCall () {
    if (!props.onCall || !state.showCall) {
      return null
    }
    const {
      phones
    } = state
    const base = (
      <CallIcon
        className='rc-pointer'
        spin={state.loadingPhones}
        onClick={onCall}
      />
    )
    if (phones.length > 1) {
      return (
        <Popover
          content={renderPhoneList(onSMS)}
        >
          {base}
        </Popover>
      )
    }
    return base
  }

  function renderSMS () {
    if (!state.showSMS) {
      return null
    }
    const {
      phones
    } = state
    const base = (
      <SMSIcon
        className='rc-pointer'
        spin={state.loadingPhones}
        onClick={onSMS}
      />
    )
    if (phones.length > 1) {
      return (
        <Popover
          content={renderPhoneList(onCall)}
        >
          {base}
        </Popover>
      )
    }
    return base
  }

  function renderMeeting () {
    if (!state.showMeeting) {
      return null
    }
    return (
      <MeetingIcon
        className='rc-pointer'
        onClick={() => props.onMeeting()}
      />
    )
  }

  function renderWebinar () {
    if (!state.showWebinar) {
      return null
    }
    return (
      <WebinarIcon
        className='rc-pointer'
        onClick={() => props.onWebinar()}
      />
    )
  }

  function renderRc () {
    if (!state.showRc) {
      return null
    }
    return (
      <RcIcon
        className='rc-pointer'
        onClick={onClickRc()}
      />
    )
  }

  function renderLoading () {
    if (!state.loading) {
      return null
    }
    return (
      <Tooltip
        title={state.loadingTip}
      >
        <Loading3QuartersOutlined
          className='rc-pointer'
        />
      </Tooltip>
    )
  }

  function renderSetting () {
    if (!state.showRc) {
      return null
    }
    return (
      <SettingFilled
        onClick={onClickRc}
        className='rc-pointer rc-setting-icon'
      />
    )
  }

  function renderContent () {
    return [
      renderRc(),
      renderCall(),
      renderSMS(),
      renderMeeting(),
      renderWebinar(),
      renderSetting(),
      renderLoading()
    ].filter(d => d)
  }

  useEffect(() => {
    upgrade()
    watch()
  }, [])
  const {
    showRc
  } = state
  if (!showRc) {
    return null
  }
  return (
    <Drag>
      <div id='rc-main'>
        {renderContent()}
      </div>
    </Drag>
  )
}
