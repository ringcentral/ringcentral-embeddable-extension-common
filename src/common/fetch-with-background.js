/**
 * fetch with background
 */

import { sendMsgToBackground } from './helpers'
import _ from 'lodash'
import { jsonHeader } from './fetch'

function defaultOptions (options) {
  return {
    method: 'get',
    headers: jsonHeader,
    timeout: 180000,
    ...options,
    body: _.isString(options.body)
      ? options.body
      : options.body
        ? JSON.stringify(options.body)
        : undefined
  }
}

export default function (url, options) {
  return sendMsgToBackground({
    action: 'fetch',
    data: {
      url,
      options: defaultOptions(options)
    }
  })
    .then(r => {
      if (r.type === 'error') {
        console.log(r.stack)
        return
      }
      return r
    })
    .catch(e => {
      console.log(e)
    })
}
