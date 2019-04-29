const { updaters } = require("./updaters.js")
const { effects } = require("./effects.js")

const handlerVersion = {
  versionName: "v1",
  updaters,
  effects,
}

module.exports = handlerVersion
