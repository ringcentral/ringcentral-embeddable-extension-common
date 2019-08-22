
/**
 * background.js for chrome extension
 */

import _ from 'lodash'

let glob = {
  urlWhiteList: []
}

let standaloneWindow
let activeTabIds = new Set()

function parseResponse (response) {
  let contentType = response.headers.get('content-type') || ''
  let isJsonResult = contentType.toLowerCase().indexOf('application/json') !== -1
  return isJsonResult ? response.json() : response.text()
}

function checkUrl (url) {
  for (let i = 0, len = glob.urlWhiteList.length; i < len; i++) {
    if (glob.urlWhiteList[i].test(url)) {
      return true
    }
  }
  return false
}

/**
 * check should show active icon for tab
 * @param {*} tab
 */
let checkTab = (tab) => {
  return tab &&
    tab.url && true
  // todo check url to match your CRM site url
  // tab.url.includes('redtailtechnology.com')
}

function getDisplayInfo () {
  return new Promise(resolve => {
    chrome.system.display.getInfo(resolve)
  })
}

function popup () {
  if (!standaloneWindow) {
    return initStandaloneWindow()
  }
  chrome.windows.update(
    standaloneWindow.id,
    {
      focused: true,
      state: 'normal'
    }
  )
}

async function initStandaloneWindow () {
  // open standalong app window when click icon
  if (!standaloneWindow) {
    const windowParam = {
      url: './standalone.html',
      type: 'popup',
      width: 300,
      height: 536
    }
    if (chrome.system && chrome.system.display) {
      let arr = await getDisplayInfo()
      let {
        width,
        height
      } = _.get(arr, '[0].workArea') || {}
      windowParam.left = parseInt(width, 10) - 300
      windowParam.top = parseInt(height, 10) - 536
      windowParam.focused = true
    }
    chrome.windows.create(windowParam, function (wind) {
      standaloneWindow = wind
      sendMsgToContent({
        action: 'widgets-window-state-notify',
        widgetsFocused: true
      })
    })
  } else {
    chrome.windows.update(standaloneWindow.id, {
      focused: true,
      state: 'normal'
    })
  }
}

function getStandaloneWindowTab () {
  return _.get(standaloneWindow, 'tabs[0]')
}

function sendMsgToTab (tab, data) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, data, function (response) {
      resolve(response)
    })
  })
}

async function sendMsgToStandAlone (data) {
  let tab = getStandaloneWindowTab()
  if (!tab) {
    return
  }
  return sendMsgToTab(tab, data)
}

async function sendMsgToContent (data) {
  let res = {}
  for (let id of activeTabIds) {
    let response = await sendMsgToTab({ id }, data)
    res[id] = response
  }
  return res
}

function getTabFromId (id) {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.get(id, resolve)
    } catch (e) {
      reject(e)
    }
  })
}

async function onTabEvent (_tab, action) {
  let tab = _.isPlainObject(_tab)
    ? _tab
    : await getTabFromId(_tab).catch(() => {})
  let { id } = tab
  if (
    checkTab(tab)
  ) {
    if (action !== 'remove') {
      chrome.pageAction.show(id)
    }
    if (action === 'add') {
      activeTabIds.add(id)
    } else if (action === 'remove') {
      activeTabIds.remove(id)
    } else if (action === 'update') {
      activeTabIds.add(id)
    }
  } else if (
    action === 'update'
  ) {
    activeTabIds.delete(id)
  }
}

function parseQuery (queryString) {
  let query = {}
  let pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&')
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=')
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }
  return query
}

function oauth (data) {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(data, (url) => {
      let q = url.split('?')[1]
      q = parseQuery(q)
      let {
        code,
        error,
        error_description: ed
      } = q
      if (code) {
        resolve(code)
      } else if (error) {
        reject(new Error(`${error}:${ed}`))
      }
    })
  })
}

export default function initBackground (checkTabFunc, urlWhiteList) {
  if (urlWhiteList) {
    glob.urlWhiteList = urlWhiteList
  }
  checkTab = checkTabFunc
  chrome.tabs.onCreated.addListener(tab => {
    onTabEvent(tab, 'add')
  })
  chrome.tabs.onUpdated.addListener((tab, changeInfo) => {
    onTabEvent(tab, 'update', changeInfo)
  })
  chrome.tabs.onRemoved.addListener(tab => {
    onTabEvent(tab, 'remove')
  })
  const pageAction = chrome.pageAction || chrome.browserAction
  pageAction.onClicked.addListener(function (tab) {
    if (pageAction.show) {
      pageAction.show(tab.id)
    }
    if (
      checkTab(tab)
    ) {
      // send message to content.js to to open app window.
      chrome.tabs.sendMessage(tab.id, { action: 'openAppWindow' }, function () {})
      initStandaloneWindow()
    }
  })

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    let {
      to,
      data,
      action
    } = request
    if (action === 'oauth') {
      oauth(data)
        .then(res => {
          res = res && res.message
            ? {
              error: res.message
            }
            : res
          sendResponse(res)
        })
        .catch(e => {
          return e
        })
      return true
    } else if (to === 'standalone') {
      sendMsgToStandAlone(data)
        .then(res => sendResponse(res))
      return true
    } else if (to === 'content') {
      sendMsgToContent(data)
        .then(res => sendResponse(res))
      return true
    } else if (action === 'popup') {
      popup()
    } else if (action === 'check-window-opened') {
      sendResponse({
        widgetsFocused: !!standaloneWindow
      })
    } else if (action === 'check-window-focused') {
      sendResponse({
        widgetsFocused: standaloneWindow && standaloneWindow.focused
      })
    } else if (action === 'fetch') {
      if (!checkUrl(data.url)) {
        return true
      }
      window.fetch(data.url, data.options)
        .then(parseResponse)
        .then(sendResponse)
        .catch(e => sendResponse({
          stack: e.stack,
          message: e.message,
          type: 'error'
        }))
      return true
    }
  })

  chrome.windows.onRemoved.addListener(function (id) {
    if (standaloneWindow && standaloneWindow.id === id) {
      standaloneWindow = null
    }
    sendMsgToContent({
      action: 'widgets-window-state-notify',
      widgetsFocused: false
    })
  })

  chrome.windows.onFocusChanged.addListener(function (id) {
    sendMsgToContent({
      action: 'widgets-window-state-notify',
      widgetsFocused: !(standaloneWindow && standaloneWindow.id !== id)
    })
  })
}
