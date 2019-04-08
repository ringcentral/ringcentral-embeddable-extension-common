/**
 * localstorage for chrome extension
 */

import _ from 'lodash'

export const get = (keys) => {
  return new Promise((resolve, reject) => {
    try {
      let arg = _.isString(keys)
        ? [keys]
        : keys
      chrome.storage.local.get(
        arg,
        function(res) {
          resolve(
            _.isString(keys)
              ? res[keys]
              : res
          )
        }
      )
    } catch(e) {
      reject(e)
    }
  })
}

export const set = (key, value) => {
  let arg = _.isString(key)
    ? {
      [key]: value
    }
    : key
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(
        arg,
        resolve
      )
    } catch(e) {
      reject(e)
    }
  })
}

export const remove = (key) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.remove(
        key,
        resolve
      )
    } catch(e) {
      reject(e)
    }
  })
}

export const clear = () => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.clear(
        resolve
      )
    } catch(e) {
      reject(e)
    }
  })
}
