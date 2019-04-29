const massive = require("massive"),
      { BaseActionWatcher } = require("demux"),
      { MongoActionReader } = require("demux-eos"),
      { MassiveActionHandler } = require("demux-postgres"),
      config = require("./config/gxConfig.json")
      handlerVersions  = require("./handlerVersions/v1"),
      migrationSequences = require("./migrationSequences");

(async () => {
   const db = await massive(config.dbConfig)
   const start_block = (db.gxc) ? await db.gxc._index_state.findOne({}, {field: ['block_number']}).then((result)=>{return (result=== null)? 1 : result.block_number++;}) : 1
   console.info("strart_block: ",start_block)

   const actionReader = new MongoActionReader({
      mongoEndpoint: config.mongoConfig.mongoEndpoint || "mongodb://127.0.0.1:27017",
      startAtBlock: config.mongoConfig.startAtBlock || start_block,
      onlyIrreversible: config.mongoConfig.onlyIrreversible || false,
      dbName: config.mongoConfig.dbName || "GXC"
   });
   try {
   await actionReader.initialize()
   const actionHandler = new MassiveActionHandler(
      [handlerVersions],
      db,
      config.dbConfig.schema,
      migrationSequences
   )

   const actionWatcher = new BaseActionWatcher(actionReader, actionHandler, 500)

   actionWatcher.watch()
   console.info(`Demux listening on port ...`)
   } catch(e) {
     console.info(e);
   }
})()
