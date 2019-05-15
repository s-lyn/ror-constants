const debug = require('debug')('ror-constants')

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

async function promiseRepeat (promiseConstructor, options = {}) {
  const {
    delay = 100,
    delayMultiplier = 2,
    repeatCount = 20
  } = options
  let currentRepeatCount = repeatCount
  let currentDelay = delay
  while (true) {
    if (currentRepeatCount <= 0) {
      throw new Error(`Promise repeated "${repeatCount}" times with error`)
    }
    try {
      const ret = await promiseConstructor()
      return ret
    } catch (err) {
      debug(`Promise repeat cathed error: ${err.message}`)
    }
    // Delay
    await new Promise(resolve => setTimeout(resolve, currentDelay))
    currentRepeatCount--
    currentDelay *= delayMultiplier
  }
}

module.exports = {
  parseCSVList,
  promiseRepeat
}
