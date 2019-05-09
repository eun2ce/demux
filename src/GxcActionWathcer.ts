import { AbstractActionReader, ExpressActionWatcher, BlockInfo } from "demux";
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

   public async run() {
      this.getBlockInfo();
      await this.watch();
   }
}
