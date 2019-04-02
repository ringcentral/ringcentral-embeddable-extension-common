

let glob = {
  urlWhiteList: []
}

function parseResponse(response) {
  let contentType = response.headers.get('content-type') || ''
  let isJsonResult = contentType.toLowerCase().indexOf('application/json') !== -1
  return isJsonResult ? response.json() : response.text()
}

function checkUrl (url) {
  for (let i = 0, len = glob.urlWhiteList.length;i < len;i ++) {
    if (glob.urlWhiteList[i].test(url)) {
      return true
    } else if (i === len - 1) {
      return false
    }
  }
}

/**
 * 
 * @param {object} tab
 */
let checkTab = (tab) => {
  return tab &&
    tab.url && true
  // todo adjust match rule
  /* example rule
      tab.url.startsWith('https') &&
      tab.url.includes('insightly.com') &&
      !tab.url.startsWith('https://www.insightly.com') &&
      !tab.url.startsWith('https://login.insightly.com') &&
      !tab.url.startsWith('https://api.insightly.com') &&
      !tab.url.startsWith('https://support.insightly.com')
      */
}

async function cb(tabId) {
  let tab = tabId.id
    ? tabId
    : await new Promise((resolve) => {
      chrome.tabs.get(tabId, resolve)
    })
  if (
    checkTab(tab)
  ) {
    if (chrome.pageAction) {
      chrome.pageAction.show(tab.id)
    }
    return
  }
}

chrome.tabs.onCreated.addListener(cb)
chrome.tabs.onUpdated.addListener(cb)

const pageAction = chrome.pageAction || chrome.browserAction
pageAction.onClicked.addListener(function (tab) {
  if (pageAction.show) {
    pageAction.show(tab.id)
  }
  if (
    checkTab(tab)
  ) {
    // send message to content.js to to open app window.
    chrome.tabs.sendMessage(tab.id, { action: 'openAppWindow' }, function(response) {
      console.log(response)
    })
    return
  }
})

function parseQuery(queryString) {
  let query = {}
  let pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&')
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=')
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }
  return query
}

function oauth(data) {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(data, (url) => {
      let q = url.split('?')[1]
      q = parseQuery(q)
      let {
        code,
        error,
        error_description
      } = q
      if (code) {
        resolve(code)
      } else if (error) {
        reject(`${error}:${error_description}`)
      }
    })
  })
}

export default function initBackground(checkTabFunc, urlWhiteList) {
  if (urlWhiteList) {
    glob.urlWhiteList = urlWhiteList
  }
  checkTab = checkTabFunc
  chrome.tabs.onCreated.addListener(cb)
  chrome.tabs.onUpdated.addListener(cb)
  const pageAction = chrome.pageAction || chrome.browserAction
  pageAction.onClicked.addListener(function (tab) {
    if (pageAction.show) {
      pageAction.show(tab.id)
    }
    if (
      checkTab(tab)
    ) {
      // send message to content.js to to open app window.
      chrome.tabs.sendMessage(tab.id, { action: 'openAppWindow' }, function(response) {
        console.log(response)
      })
      return
    }
  })

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let {
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
    } else if (action === 'fetch') {
      if (!checkUrl(data.url)) {
        return true
      }
      fetch(data.url, data.options)
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
}
