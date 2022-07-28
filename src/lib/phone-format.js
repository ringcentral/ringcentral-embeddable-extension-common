import _ from 'lodash'
import {
  parsePhoneNumberFromString
} from 'libphonenumber-js'

export function getFullNumber (numberObj) {
  if (!numberObj) {
    return ''
  } else if (_.isString(numberObj)) {
    return numberObj
  }
  const {
    extensionNumber,
    phoneNumber = ''
  } = numberObj
  return phoneNumber +
    (extensionNumber ? '#' + extensionNumber : '')
}

export function format164 (
  phone = '',
  country = window.rc.countryCode || 'US'
) {
  const res = parsePhoneNumberFromString(phone, country)
  if (!res) {
    return false
  }
  return res.number + (res.ext ? '#' + res.ext : '')
}

export function checkPhoneNumber (
  phone = '',
  countryCode = 'US'
) {
  return parsePhoneNumberFromString(phone, countryCode)
}
