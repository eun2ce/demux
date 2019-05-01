import { BaseActionWatcher } from "demux";
import { config } from "dotenv";
import { handlerVersions } from "./handlerVersions/v1";
import { MongoActionReader } from "demux-eos";
import { MassiveActionHandler } from "demux-postgres";
import massive = require("massive");
import { migrationSequences } from "./migrationSequences";

config();
const dbConfig: massive.ConnectionInfo = {
   database: process.env.POSTGRES_DBNAME || "GXC",
   host: process.env.POSTGRES_HOST || "127.0.0.1",
   password: process.env.POSTGRES_PASS || "",
   port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
   schema: process.env.POSTGRES_SCHEMA || "gxc",
   user: process.env.POSTGRES_UNAME || "postgres",
};
console.info("DB Config >>>\n", dbConfig);

const init = async () => {

   const db = await massive(dbConfig);

   const startBlock = (db.gxc)
    ? await db.gxc._index_state.findOne({}, {field: ["block_number"]})
        .then(function(result) {
            return(result === null) ? 1 : result.block_number ++;
        })
    : 1;
   console.info("Startblock Number is ", startBlock);

   const actionReader: any = new MongoActionReader(
      {
         dbName: process.env.MONGO_DB || "GXC",
         mongoEndpoint: process.env.MONGO_ENDPOINT || "mongodb://127.0.0.1:27017",
         onlyIrreversible: false,
         startAtBlock: process.env.MONGO_STARTBLOCK || startBlock,
      },
   );

   try {
      await actionReader.initialize();
      const actionHandler = new MassiveActionHandler(
         [handlerVersions],
         db,
         dbConfig.schema,
         migrationSequences,
      );

      const actionWatcher = new BaseActionWatcher(actionReader, actionHandler, 500);

      actionWatcher.watch();
      console.info(`Demux listening on ${ dbConfig.port }port..`);
   } catch (e) {
      console.info(e);
   }
};

const exit = (e: any) => {
  console.error("An error has occured. error is: %s and stack trace is: %s", e, e.stack);
  console.error("Process will restart now.");
  process.exit(1);
};

process.on("unhandledRejection", exit);
process.on("uncaughtException", exit);
setTimeout(init, 2500);
