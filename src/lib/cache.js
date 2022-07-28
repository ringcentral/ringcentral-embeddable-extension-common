/**
 * cache module
 */

import * as ls from './ls.js'

export function setCache (
  key,
  value,
  expire = 10000
) {
  return ls.set(key, {
    value,
    expire: expire === 'never'
      ? 'Infinity'
      : (+new Date()) + expire
  })
    .catch(console.log)
}

export async function getCache (key) {
  const now = +new Date()
  const v = await ls.get(key).catch(console.log)
  return v && v.expire > now
    ? v.value
    : null
}
