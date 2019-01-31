/**
 * insert click-to-call button at special position/page based on './content-insert-config.js'
 * but still, you can add custom button if the config does not meet your needs
 */

import {
  dirtyLoop,
  createCallBtnHtml,
  createElementFromHTML,
  callWithRingCentral,
  smsWithRingCentral,
  onClickPhoneNumber,
  RCBTNCLS2
} from '../common/helpers'

class insertHandler {
  constructor(config) {
    this.config = config
    let {
      shouldAct
    } = this.config
    dirtyLoop(
      shouldAct,
      this.tryAddCallBtn
    )
  }

  getParentDom = () => {
    let {
      parentsToInsertButton
    } = this.config
    let {length} = parentsToInsertButton
    let res = {
      elem: null
    }
    for (let i = 0;i < length;i ++) {
      let pc = parentsToInsertButton[i]
      res.elem = pc.getElem()
      res.insertMethod = pc.insertMethod
      if (res.elem) {
        break
      }
    }
    return res
  }

  isButtonInserted = () => {
    let parent = this.getParentDom().elem
    if (!parent) {
      return false
    }
    return !!parent.querySelector('.' + RCBTNCLS2)
  }

  //in contact call tab try add call with ringcentral button
  tryAddCallBtn = async () => {
    let {href} = location
    let {
      shouldAct,
      getContactPhoneNumbers
    } = this.config
    if (!shouldAct(href)) {
      return
    }
    if (this.isButtonInserted()) {
      return
    }
    let parent = this.getParentDom().elem
    if (!parent) {
      return
    }
    let callWithRingCentralBtn = parent.querySelector('.' + RCBTNCLS2)
    if (callWithRingCentralBtn) {
      return
    }
    let phoneNumbers = await getContactPhoneNumbers()
    if (phoneNumbers.length) {
      this.addCallWithRingCentralButton(phoneNumbers)
    }
  }

  addCallWithRingCentralButton = (phoneNumbers) => {
    let {elem, insertMethod} = this.getParentDom()
    if (!elem) {
      return
    }
    let callByRingCentralBtn = createElementFromHTML(
      createCallBtnHtml(RCBTNCLS2 + ' rc-hide-dd', phoneNumbers)
    )
    let call = callByRingCentralBtn.querySelector('.rc-widget-c2d-icon')
    let sms = callByRingCentralBtn.querySelector('.rc-widget-c2sms-icon')
    let dd = callByRingCentralBtn.querySelector('.rc-call-dds')
    call.addEventListener('click', (e) => {
      if (phoneNumbers.length === 1) {
        return callWithRingCentral(phoneNumbers[0].number)
      }
      else {
        this.type = 'call'
        callByRingCentralBtn.classList.remove('rc-hide-dd')
      }
    })
    callByRingCentralBtn.addEventListener('mouseleave', e => {
      callByRingCentralBtn.classList.add('rc-hide-dd')
    })
    sms.addEventListener('click', (e) => {
      if (phoneNumbers.length === 1) {
        return smsWithRingCentral(phoneNumbers[0].number)
      }
      else {
        this.type = 'sms'
        callByRingCentralBtn.classList.remove('rc-hide-dd')
      }
    })
    dd.addEventListener('click', (e) => {
      onClickPhoneNumber(e, this.type === 'sms')
    })
    elem[insertMethod](
      callByRingCentralBtn,
      elem.childNodes[0]
    )
  }

}

function processInsert(config) {
  return new insertHandler(config)
}

export default (config) => {
  (config.insertClickToCallButton || []).forEach(processInsert)
}
