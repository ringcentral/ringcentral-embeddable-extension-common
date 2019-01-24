/**
 * make phone number text to tel link and click-to-dial
 * config proper selector in './config.js', it will be done
 * but still, you can add custom behaviors if the config does not meet your needs
 */

import {
  callWithRingCentral
} from '../common/helpers'

import C2D from '../common/click-to-dial-inject'

function processLink(config) {
  let conf = {
    onCallClick: callWithRingCentral,
    selector: config.selector,
    isTelNode: (node) => {
      return node.matches ? node.matches(config.selector) : false
    },
    getPhoneNumber: config.getPhoneNumber || (node => {
      return node.textContent.trim()
    })
  }
  return new C2D(conf)
}

export default (config) => {
  (config.phoneNumberSelectors || []).forEach(processLink)
}
