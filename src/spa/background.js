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
    chrome.pageAction.show(tab.id)
    return
  }
}

chrome.tabs.onCreated.addListener(cb)
chrome.tabs.onUpdated.addListener(cb)

chrome.pageAction.onClicked.addListener(function (tab) {
  chrome.pageAction.show(tab.id)
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

export default function initBackground(checkTabFunc) {
  checkTab = checkTabFunc
  chrome.tabs.onCreated.addListener(cb)
  chrome.tabs.onUpdated.addListener(cb)
  chrome.pageAction.onClicked.addListener(function (tab) {
    chrome.pageAction.show(tab.id)
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
}
