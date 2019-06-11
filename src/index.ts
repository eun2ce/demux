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

import { IndexingStatus } from "demux";
import { GxcActionWatcher } from "./GxcActionWathcer";
import { GxcMongoActionReader } from "./GxcMongoActionReader";
import { handlerVersions } from "./handlerVersions/v1";
import { MassiveGxcActionHandler } from "./MassiveGxcActionHandler";
import { migrationSequences } from "./migrationSequences";

async function init() {
   try {
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
            startAtBlock:  process.env.MONGO_STARTBLOCK || startBlock,
         },
      );

      const actionHandler = new MassiveGxcActionHandler(
         [handlerVersions],
         db,
         dbConfig.schema,
         migrationSequences,
      );

      const actionWatcher = new GxcActionWatcher(actionReader, actionHandler);
      await actionReader.initialize();
      main(actionWatcher, 10000);
   } catch (err) {
      logger.error(err);
   }
}

async function main(actionWatcher: any, timeInterval: number) {
   //logger.info(new Date().toISOString(), " : check demux alive");
   if ( actionWatcher.info.indexingStatus === IndexingStatus.Initial
      || actionWatcher.info.indexingStatus === IndexingStatus.Stopped ) {
      logger.info("DEMUX STARTING INDEXING.");
      actionWatcher.watch();
   }
   setTimeout(async () => await main(actionWatcher, timeInterval), timeInterval);
}

init();
