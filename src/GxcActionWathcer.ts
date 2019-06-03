import { AbstractActionReader, ExpressActionWatcher, BlockInfo, IndexingStatus } from "demux";
import { MassiveActionHandler } from "demux-postgres";
import express from "express";

export class GxcActionWatcher extends ExpressActionWatcher {
   protected actionReader: AbstractActionReader;
   protected actionHandler: MassiveActionHandler;
   protected pollInterval: number;
   protected port: number;

   express: express.Express;
   constructor(actionReader: AbstractActionReader,
               actionHandler: MassiveActionHandler,
               pollInterval: number = parseInt(process.env.DEMUX_POLLINTERVAL, 10),
               port: number = parseInt(process.env.MONGO_PORT, 10)) {
      super(actionReader, actionHandler, pollInterval, port);
   };

   public async getBlockInfo() {
      this.log.info("current block number: ", this.actionReader["currentBlockData"].blockInfo["blockNumber"]);
   }

   public async run(timeInterval: number) {
      if ( this.info.indexingStatus === IndexingStatus.Initial
         ||this.info.indexingStatus === IndexingStatus.Stopped ) {
         this.log.info("DEMUX STARTING INDEXING.");
         this.watch();
      }
      setTimeout(async () => await this.run(timeInterval), timeInterval);
   }
}
