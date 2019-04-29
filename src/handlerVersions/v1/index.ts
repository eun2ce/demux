const { updaters } = require("./updaters")
const { effects } = require("./effects")

const handlerVersion = {
  versionName: "v1",
  updaters,
  effects,
}

module.exports = handlerVersion
