/**
 * indexed db wrapper
 */

import { thirdPartyConfigs } from './app-config'
import _ from 'lodash'
import {
  formatPhone
} from './helpers'

const { JsStore } = window
const {
  appName,
  dbSchema = {},
  pageSize = 100,
  serviceName
} = thirdPartyConfigs

const dbName = appName.replace(/-/g, '_')
const tableName = 'Contact'

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
  const db = {
    name: dbName,
    tables: [tblContact]
  }
  return db
}

export const connection = new JsStore.Instance()

const databaseConf = getDbSchema()

function initJsStore () {
  return connection.initDb(databaseConf)
}

export async function remove () {
  await initJsStore()
  await connection.remove({
    from: tableName
  })
}

/**
 * fetch contacts by page number from 0
 * @param {number} page
 */
export async function getByPage (page = 1) {
  await initJsStore()
  let count = await connection.select({
    from: tableName
  })
  let result = await connection.select({
    from: tableName,
    limit: pageSize,
    skip: (page - 1) * pageSize
  })
  return {
    count: count.length,
    result
  }
}

export async function insert (itemOritems) {
  const items = _.isArray(itemOritems)
    ? itemOritems
    : [itemOritems]
  await initJsStore()
  await connection.insert({
    into: tableName,
    values: items
  })
}

export async function search (keyword, page = 1) {
  const q = {
    where: {
      name: {
        regex: new RegExp(keyword.replace(/\//g, '\\/'))
      },
      or: {
        phoneNumbersForSearch: {
          regex: new RegExp(
            keyword
              .replace(/\//g, '\\/')
              .replace(/\(|\)|-/g, '')
          )
        }
      }
    }
  }
  await initJsStore()
  return connection.select({
    from: tableName,
    limit: pageSize,
    ignoreCase: true,
    skip: (page - 1) * pageSize,
    ...q
  })
}

export async function match (phoneNumbers, page = 1) {
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
    .map(d => d.replace('+', '\\+'))
    .join('|')
  const q = {
    where: {
      phoneNumbersForSearch: {
        regex: new RegExp(ns)
      }
    }
  }
  await initJsStore()
  const res = await connection.select({
    from: tableName,
    limit: pageSize,
    ignoreCase: true,
    skip: (page - 1) * pageSize,
    ...q
  })
  return res.reduce((prev, it) => {
    let phone = _.find(it.phoneNumbers, n => {
      return formatedNumbers.includes(
        formatPhone(n.phoneNumber)
      )
    })
    let num = phone.phoneNumber
    let key = formatNumbersMap[formatPhone(num)]
    if (!prev[key]) {
      prev[key] = []
    }
    let res = {
      id: it.id, // id to identify third party contact
      type: serviceName, // need to same as service name
      name: it.name,
      phoneNumbers: it.phoneNumbers
    }
    prev[key].push(res)
    return prev
  }, {})
}
