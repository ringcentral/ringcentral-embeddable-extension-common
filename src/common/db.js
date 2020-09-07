/**
 * indexed db wrapper
 */

import { thirdPartyConfigs } from './app-config'
import _ from 'lodash'
import {
  formatPhone
} from './helpers'
import Dexie from 'dexie'

const {
  appName,
  dbSchema = {},
  pageSize = 100,
  dbNameFix = ''
} = thirdPartyConfigs

const dbName = appName.replace(/-/g, '_') + dbNameFix
export const tableName = 'Contact'

function getDbSchema () {
  const tblContact = {
    name: tableName,
    columns: {
      id: {
        primaryKey: true,
        dataType: 'string'
      },
      type: {
        dataType: 'string'
      },
      name: {
        dataType: 'string'
      },
      phoneNumbers: {
        dataType: 'array'
      },
      emails: {
        dataType: 'array'
      },
      phoneNumbersForSearch: {
        dataType: 'string'
      },
      ...dbSchema
    }
  }
  const str = ['id', 'name','phoneNumbersForSearch'].join(',')
  const db = {
    [tableName]: str
  }
  return db
}

const databaseConf = getDbSchema()
const db = new Dexie(dbName)
db.version(1).stores(databaseConf)

export async function remove () {
  return db[tableName].clear()
}

/**
 * fetch contacts by page number from 0
 * @param {number} page
 */
export async function getByPage (page = 1, _pageSize = pageSize) {
  let count = await db[tableName].count()
  let result = await db[tableName]
    .limit(_pageSize)
    .offset((page - 1) * _pageSize)
    .toArray()
  return {
    count,
    result
  }
}

export async function insert (itemOritems, upsert = true) {
  const items = _.isArray(itemOritems)
    ? itemOritems
    : [itemOritems]
  return upsert
    ? db[tableName].bulkPut(items)
    : db[tableName].bulkAdd(items)

}

export async function search (keyword, page = 1, per = pageSize) {
  if (!keyword) {
    per = 100
    return []
  }
  const reg = new RegExp(_.escapeRegExp(keyword), 'i')
  return db[tableName]
    .offset((page - 1) * per)
    .limit(per)
    .where('name')
    .startsWith(keyword)
    .or('phoneNumbersForSearch')
    .startsWith(keyword)
    .toArray()
}

export async function match (_phoneNumbers, limit = 100) {
  const phoneNumbers = _phoneNumbers.filter(p => p)
  if (_.isEmpty(phoneNumbers)) {
    return {}
  }
  let { formatedNumbers, formatNumbersMap } = phoneNumbers.reduce((prev, n) => {
    let nn = formatPhone(n)
    prev.formatedNumbers.push(nn)
    prev.formatNumbersMap[nn] = n
    return prev
  }, {
    formatedNumbers: [],
    formatNumbersMap: {}
  })
  const ns = formatedNumbers
    .map(d => _.escapeRegExp(d))
    .join('|')
  const reg = new RegExp(ns)
  const res = await db[tableName]
    .limit(limit)
    .filter(inst => {
      return reg.test(inst.phoneNumbersForSearch)
    })
    .toArray()
  return res.reduce((prev, it) => {
    let phone = _.find(it.phoneNumbers, n => {
      return formatedNumbers.includes(
        formatPhone(n.phoneNumber)
      )
    })
    if (!phone) {
      return prev
    }
    let num = phone.phoneNumber
    let key = formatNumbersMap[formatPhone(num)]
    if (!prev[key]) {
      prev[key] = []
    }
    prev[key].push(it)
    return prev
  }, {})
}
