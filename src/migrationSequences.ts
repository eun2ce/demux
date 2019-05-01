import { Migration } from "demux-postgres";

const gxcAction = new Migration(
   "gxcAction", "gxc", "./migrations/gxcontract.sql");

export const migrationSequences = [{
  migrations: [gxcAction],
  sequenceName: "init",
}];
