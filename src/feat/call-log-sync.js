/**
 * call log sync feature
 */

import {thirdPartyConfigs} from '../common/app-config'
import {createForm} from '../common/call-log-sync-form'
import extLinkSvg from '../common/link-external.svg'
import {
  showAuthBtn
} from './auth'
import _ from 'lodash'
import {
  notify,
  host
} from '../common/helpers'

let {
  showCallLogSyncForm,
  serviceName
} = thirdPartyConfigs

/**
 * when sync success, notify success info
 * todo: set real link
 * @param {string} id
 */
export function notifySyncSuccess({
  id
}) {
  let type = 'success'
  let url = `${host}/details/Event/${id}`
  let msg = `
    <div>
      <div class="rc-pd1b">
        Call log synced to ${serviceName}!
      </div>
      <div class="rc-pd1b">
        <a href="${url}" target="_blank">
          <img src="${extLinkSvg}" width=16 height=16 class="rc-iblock rc-mg1r" />
          <span class="rc-iblock">
            Check Event Detail
          </span>
        </a>
      </div>
    </div>
  `
  notify(msg, type, 9000)
}

/**
 * sync call log from ringcentral widgets to third party CRM site
 * @param {*} body
 */
export async function syncCallLogToThirdParty(body) {
  let result = _.get(body, 'call.result')
  if (result !== 'Call connected') {
    return
  }
  let isManuallySync = !body.triggerType
  let isAutoSync = body.triggerType === 'callLogSync'
  if (!isAutoSync && !isManuallySync) {
    return
  }
  if (!window.rc.local.apiKey) {
    return isManuallySync ? showAuthBtn() : null
  }
  if (showCallLogSyncForm && isManuallySync) {
    return createForm(
      body.call,
      serviceName,
      (formData) => doSync(body, formData)
    )
  } else {
    doSync(body, {})
  }
}

/**
 * sync call log action
 * todo: need you find out how to do the sync
 * you may check the CRM site to find the right api to do it
 * @param {*} body
 * @param {*} formData 
 */
async function doSync(body, formData) {
  console.log(body, formData)
  let success = true
  if (success) {
    notifySyncSuccess({id: ''})
  } else {
    notify('call log sync to third party failed', 'warn')
    console.log('post /Metadata/Create error')
    console.log('some error')
  }
}

