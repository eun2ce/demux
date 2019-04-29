const { Migration } = require("demux-postgres")

const gxcAction = new Migration(
   "gxcAction", "gxc", "./migrations/gxcontract.sql")

module.exports = [{
  migrations: [gxcAction],
  sequenceName: "init"
}]
