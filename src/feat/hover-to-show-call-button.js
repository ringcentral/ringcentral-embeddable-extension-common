/**
 * add event handler to developer configed element,
 * show click-to-dial tooltip to the elements
 * config defined at './content-insert-config' hoverShowClickToCallButton section
 * but still, you can add custom behaviors if the config does not meet your needs
 */

import _ from 'lodash'
import {
  dirtyLoop,
  findParentBySel,
  createCallBtnHtml,
  createElementFromHTML,
  callWithRingCentral,
  RCTOOLTIPCLS,
  notify,
  RCBTNCLS,
  onClickPhoneNumber,
  RCLOADINGCLS,
  createPhoneList,
  smsWithRingCentral
} from '../common/helpers'
import createLoading from '../common/loading'

class HoverHandler {
  constructor (config) {
    this.config = config
    let {
      shouldAct
    } = this.config
    dirtyLoop(
      shouldAct,
      this.addHover,
      this.tryRMEvents
    )
  }

  currentRow = null

  addHover = () => {
    let { href } = window.location
    if (!this.config.shouldAct(href)) {
      return
    }
    document.addEventListener('mouseenter', this.handleAddRCBtn, true)
  }

  handleAddRCBtn = _.debounce((e) => {
    let { target } = e
    let {
      selector
    } = this.config
    let dom = findParentBySel(target, selector)
    let isToolTip = findParentBySel(target, '.' + RCTOOLTIPCLS)
    if (!dom && !isToolTip && this.currentRow) {
      this.hideRCBtn()
    }
    if (!dom || this.currentRow === dom) {
      return
    }
    this.currentRow = dom
    let { tooltip } = this.getRCTooltip()
    tooltip.setAttribute('style', this.buildStyle(e, dom))
  }, 200)

  /**
   * build tooltip postition style from event
   * @param {*} e
   */
  buildStyle = (e, dom) => {
    let { clientX } = e
    let {
      top
    } = dom.getBoundingClientRect()
    if (clientX > window.innerWidth - 120) {
      clientX = window.innerWidth - 120
    }
    return `left:${clientX + 3}px;top:${top - 5}px;display:block;`
  }

  /**
   * get ringcentral contact button wrap dom
   * if not created, just create and append to body
   */
  getRCTooltip = () => {
    let tooltip = document.querySelector('.' + RCTOOLTIPCLS)
    let hasToolTip = !!tooltip
    let isShowing = tooltip
      ? tooltip.style.display === 'block'
      : false
    if (!hasToolTip) {
      tooltip = createElementFromHTML(`
        <div class="${RCTOOLTIPCLS}">
          ${createCallBtnHtml()}
        </div>
      `)
    } else {
      tooltip.innerHTML = createCallBtnHtml()
    }
    let call = tooltip.querySelector('.rc-widget-c2d-icon')
    let sms = tooltip.querySelector('.rc-widget-c2sms-icon')
    call.onclick = () => this.onClick()
    sms.onclick = () => this.onClick(true)
    if (!hasToolTip) {
      document.body.appendChild(tooltip)
    }
    return { tooltip, isShowing }
  }

  onClick = async (sms = false) => {
    let { currentRow } = this
    let { getContactPhoneNumbers } = this.config
    this.loading(true)
    let numbers = await getContactPhoneNumbers(currentRow)
    this.loading(false)
    if (!numbers.length) {
      notify('No phone number for this contact', 'warn')
      return this.hideRCBtn()
    } else if (numbers.length === 1) {
      this.hideRCBtn()
      if (sms) {
        smsWithRingCentral(numbers[0].number)
      } else {
        callWithRingCentral(numbers[0].number)
      }
    } else {
      this.showNumbers(numbers, sms)
    }
  }

  showNumbers = (numbers, sms) => {
    let phonesHtml = createPhoneList(numbers, 'rc-phone-list')
    let dom = createElementFromHTML(phonesHtml)
    let tooltip = document.querySelector(
      `.${RCTOOLTIPCLS}`
    )
    if (tooltip) {
      tooltip.appendChild(dom)
      tooltip.onclick = (e) => onClickPhoneNumber(e, sms)
    }
  }

  loading = isLoading => {
    if (isLoading) {
      let { tooltip } = this.getRCTooltip()
      let dom = tooltip.querySelector(`.${RCBTNCLS}`)
      dom.appendChild(
        createLoading()
      )
    } else {
      let ld = document.querySelector(
        `.${RCTOOLTIPCLS} .${RCLOADINGCLS}`
      )
      if (ld) {
        ld.remove()
      }
    }
  }

  hideRCBtn = _.debounce(() => {
    this.currentRow = null
    let { tooltip } = this.getRCTooltip()
    tooltip.setAttribute('style', 'display:none')
  }, 200)

  tryRMEvents = () => {
    document.removeEventListener('mouseenter', this.handleAddRCBtn, true)
  }
}

function processHover (config) {
  return new HoverHandler(config)
}

export default (config) => {
  (config.hoverShowClickToCallButton || []).forEach(processHover)
}
