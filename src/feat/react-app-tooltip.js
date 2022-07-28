/**
 * add click to call/sms/meeting button tooltip to phone number selectors
 * example config:
  const config = {
    countryCode: 'US',
    onCall: function,
    onSMS: function,
    onMeeting: function,
    tooltipConfigs: [
      {
        shouldAct: () => {
          return /\/deal\/\d+/.test(window.location.href)
        },
        selector: '[data-test="activity-note"] b'
      }
    ]
  }
 */

import { useState, useEffect, useRef } from 'react'
import {
  Spin
} from 'antd'
import { createPopper } from '@popperjs/core'
import {
  RcIcon,
  CallIcon,
  SMSIcon,
  MeetingIcon,
  WebinarIcon
} from '../icons-ui/index.js'
import _ from 'lodash'
import {
  findParentBySel
} from '../lib/dom.js'
import {
  tooltipCls,
  tooltipId,
  actions
} from '../lib/constants.js'
import { checkPhoneNumber } from '../lib/phone-format.js'

/**
 *
 * @param {*} props
 * @returns
 */
export function TooltipRcExtApp (props) {
  const [
    state,
    change
  ] = useState({
    phone: '',
    show: false,
    loading: false
  })
  const currentDom = useRef(null)
  const currentConf = useRef(null)

  function setState (ext) {
    change(old => {
      return {
        ...old,
        ...ext
      }
    })
  }

  function getDom (target, tooltipConfigs) {
    let dom
    for (const conf of tooltipConfigs) {
      const r = conf.shouldAct()
      if (!r) {
        continue
      }
      dom = findParentBySel(target, conf.selector)
      if (dom) {
        const phone = checkPhoneNumber(dom.textContent || '', window._rc.countryCode)
        if (phone) {
          setState({
            phone
          })
          return dom
        }
      }
    }
  }

  function getRCTooltip () {
    return document.getElementById(tooltipId)
  }

  function hide () {
    currentConf.current = null
    currentDom.current = null
    setState({
      show: false
    })
  }

  const onMouseEnter = _.debounce((e) => {
    if (currentDom.current) {
      return
    }
    const { target } = e
    const {
      tooltipConfigs = []
    } = props

    const dom = getDom(target, tooltipConfigs)
    const isToolTip = findParentBySel(target, '.' + tooltipCls)
    if (!dom || isToolTip) {
      return hide()
    }
    currentDom.current = dom
    const tooltip = getRCTooltip()
    setState({
      show: true
    })
    createPopper(dom, tooltip, {
      placement: 'top'
    })
  }, 1000)

  function onEvent (e) {
    const {
      action,
      data
    } = e.data || {}
    if (action === actions.updateRcTooltipState) {
      setState(data)
    }
  }

  function watch () {
    document.addEventListener('mouseenter', onMouseEnter, true)
    window.addEventListener('message', onEvent)
  }

  async function onCall () {
    props.onCall(state.phone)
  }

  function onSMS () {
    props.onSMS(state.phone)
  }

  function renderCall () {
    if (!props.onCall) {
      return null
    }
    return (
      <CallIcon
        className='rc-pointer'
        onClick={onCall}
      />
    )
  }

  function renderSMS () {
    if (!props.onSMS) {
      return null
    }
    return (
      <SMSIcon
        className='rc-pointer'
        onClick={onSMS}
      />
    )
  }

  function renderMeeting () {
    if (!props.onMeeting) {
      return null
    }
    return (
      <MeetingIcon
        className='rc-pointer'
        onClick={() => props.onMeeting(state.phone)}
      />
    )
  }

  function renderWebinar () {
    if (!props.onWebinar) {
      return null
    }
    return (
      <WebinarIcon
        className='rc-pointer'
        onClick={() => props.onWebinar(state.phone)}
      />
    )
  }

  function renderRc () {
    if (!props.onClickRc) {
      return null
    }
    return (
      <RcIcon
        className='rc-pointer'
        onClick={() => props.onClickRc(state.phone)}
      />
    )
  }

  function renderContent () {
    return [
      renderCall(),
      renderSMS(),
      renderMeeting(),
      renderWebinar(),
      renderRc()
    ].filter(d => d)
  }

  useEffect(() => {
    watch()
  }, [])
  const {
    loading,
    show
  } = state
  const cls = show ? 'show' : 'rc-hide'

  return (
    <div id={tooltipId} className={cls + ' ' + tooltipCls}>
      <Spin spinning={loading}>
        {renderContent()}
      </Spin>
    </div>
  )
}
