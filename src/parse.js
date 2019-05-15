const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')
const debug = require('debug')('ror-constants')

const FILE_NAME = path.join(__dirname, '../data/all.json')

function parseCSVList (body) {
  return body
    .split('\n')
    .map(el => {
      const value = String(el).trim()
      if (!value) {
        return null
      }
      const obj = value.split(';')
      if (obj.length === 2) {
        return {
          id: obj[0],
          value: obj[1]
        }
      }
    })
    .filter(el => !!el)
}

async function parseSubjects () {
  const url =
    'https://rosreestr.ru/wps/portal/p/cc_ib_portal_services/online_request/'
  const response = await fetch(url)
  if (response.status !== 200) {
    throw new Error(`Unexpected HTTP status code "${response.status}"`)
  }
  const body = await response.text()
  const $ = cheerio.load(body)
  const options = $('#oSubjectId option[value]')
  return options.map((index, node) => {
    const el = $(node)
    const id = el.attr('value')
    const value = el.text()
    return { type: 'subject', id, value }
  })
    .get()
}

async function getChildren (parentId, type = '', settlementType = -1) {
  const url = 'https://rosreestr.ru/wps/PA_RRORSrviceExtended/Servlet/' +
    `ChildsRegionController?parentId=${parentId}` +
    `&settlement_type=${settlementType}&add_settlement_type=false`
  const response = await fetch(url)
  if (response.status !== 200) {
    throw new Error(`Unexpected HTTP status code "${response.status}"`)
  }
  const body = await response.text()
  return parseCSVList(body)
    .map(el => Object.assign(el, { type }))
}

async function getChildrenTypes (parentId) {
  const url = 'https://rosreestr.ru/wps/PA_RRORSrviceExtended/Servlet/' +
    `ChildsRegionTypesController?parentId=${parentId}`
  const response = await fetch(url)
  if (response.status !== 200) {
    throw new Error(`Unexpected HTTP status code "${response.status}"`)
  }
  const body = await response.text()
  return parseCSVList(body)
}

async function run () {
  let count = 0
  // Parse cadastral subjects
  let subjects = await parseSubjects()
  // Parse cadastral regions
  for (const subject of subjects) {
    debug(`Parsing subject "${subject.value}"`)
    let regions = await getChildren(subject.id, 'region')
    subject.children = regions
    // Parse region's settlement types
    for (const region of regions) {
      region.children = []
      const settlementTypes = await getChildrenTypes(region.id)
      // Parse each settlement type separately
      for (const settlementType of settlementTypes) {
        const {
          id: settlementTypeId,
          value: settlementTypeValue
        } = settlementType
        let settlements =
          await getChildren(region.id, 'settlement', settlementTypeId)
        settlements = settlements
          .map(settlement => Object.assign(settlement, {
            settlementId: settlementTypeId,
            settlementType: settlementTypeValue
          }))
        region.children = [...region.children, ...settlements]
        count += settlements.length
      }
    }
  }
  // Save to file
  await fs.writeFile(FILE_NAME, JSON.stringify(subjects, undefined, 2))
  return count
}

console.time('Total time')
run()
  .then((count) => {
    console.log(`Saved ${count} settlements - SUCCESS`)
    console.timeEnd('Total time')
  })
  .catch(console.error)
