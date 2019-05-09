import { GxcActionWatcher } from "./GxcActionWathcer";
import { GxcMongoActionReader } from "./GxcMongoActionReader";
import { handlerVersions } from "./handlerVersions/v1";
import { MassiveGxcActionHandler } from "./MassiveGxcActionHandler";
import { migrationSequences } from "./migrationSequences";

import { config } from "dotenv";
import massive = require ("massive");
import * as pino from "pino";

config();
const logger = pino({prettyPrint: true});

const dbConfig: massive.ConnectionInfo = {
   database: process.env.POSTGRES_DBNAME || "GXC",
   host: process.env.POSTGRES_HOST || "127.0.0.1",
   password: process.env.POSTGRES_PASS || "",
   port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
   schema: process.env.POSTGRES_SCHEMA || "gxc",
   user: process.env.POSTGRES_UNAME || "postgres",
};

const init = async () => {
   const db = await massive(dbConfig);
   const startBlock = (db.gxc)
    ? await db.gxc._index_state.findOne({}, {field: ["block_number"]})
        .then(function(result) {
            return(result === null) ? 1 : result.block_number ++;
        })
      : 1;

   const actionReader: any = new GxcMongoActionReader(
      {
         dbName: process.env.MONGO_DB || "GXC",
         mongoEndpoint: process.env.MONGO_ENDPOINT || "mongodb://127.0.0.1:27017",
         onlyIrreversible: false,
         startAtBlock: process.env.MONGO_STARTBLOCK || startBlock,
      },
   );

   try {
      await actionReader.initialize();
      const actionHandler = new MassiveGxcActionHandler(
         [handlerVersions],
         db,
         dbConfig.schema,
         migrationSequences,
      );

      const actionWatcher = new GxcActionWatcher(actionReader, actionHandler);
      actionWatcher.run();
      logger.info("start block number: ", startBlock);
      logger.info("running demux");
   } catch (e) {
      logger.error(e);
   }
};

const exit = (e: any) => {
   logger.error("An error has occured. \nerror is: %s \nstack trace is: %s \n", e, e.stack);
   logger.error("Process will restart now.");
   process.exit(1);
};

process.on("unhandledRejection", exit);
process.on("uncaughtException", exit);
setTimeout(init, 2500);
