/**
 * use extension oauth api
 */

 /**
  * get auth code through oauth2.0 flow
  * @param url {string} auth url
  * @param interactive {bool}
  */
export default function getAuthCode(url, interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      data: {
        url: authUrl,
        interactive: true
      },
      action: 'oauth'
    }, res => {
      if (_.isString(res)) {
        resolve(res)
      } else if (res && res.error) {
        reject(res.error)
      } else {
        reject(new Error('unknow error'))
      }
    })
  })
}