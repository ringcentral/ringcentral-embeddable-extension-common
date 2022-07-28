/**
 * upgrade notification module
 */

import { envs } from '../lib/env.js'
import { notification, Button } from 'antd'
import { RcIcon } from '../icons-ui/icon-rc.js'
import axios from 'axios'
import { compare } from '../lib/compare-version.js'
import { DownloadOutlined } from '@ant-design/icons'

const {
  upgradeServer,
  appName,
  appVersion
} = envs

const keySkipVersions = `${appName}_skip_versions`

function skipVersion (ver) {
  window.upgradeNotify?.destroy()
  window.localStorage.setItem(keySkipVersions, ver)
}

export async function upgrade () {
  if (!upgradeServer) {
    return
  }
  const url = `${upgradeServer}?name=${appName}`
  const res = await axios.get(url)
    .then(r => r.data)
    .catch(e => {
      console.log('fetch upgrade info for', appName, 'failed', e)
    })
  if (!res || res.id !== appName) {
    return
  }
  const { version } = res
  const com = compare(version, appVersion)
  if (com <= 0) {
    return
  }
  if (window.localStorage.getItem(keySkipVersions) === version) {
    return
  }
  const upDom = document.getElementById('rc-upgrade-dom')
  if (upDom) {
    return
  }
  const body = res.data?.release?.body?.split(/\r/g)
    .filter(d => d.trim())
    .map((d, i) => {
      return d.startsWith('#')
        ? (<h3 key={i + 'dom'}>${d}</h3>)
        : (<div key={i + 'dom'}>${d}</div>)
    })

  const desc = (
    <div>
      {body}
      <p>
        <a
          href={res.data.release.html_url}
          target='_blank'
          rel='noreferrer'
        >
          <Button
            icon={<DownloadOutlined />}
            type='link'
          >
            Download now!
          </Button>
        </a>
      </p>
      <p class='rc-pd2t'>
        <Button
          type='default'
          onClick={skipVersion}
        >
          Skip this version
        </Button>
      </p>
    </div>
  )
  window.upgradeNotify = notification.info({
    message: `New version released: ${version}`,
    icon: <RcIcon />,
    placement: 'bottomLeft',
    description: desc
  })
}
