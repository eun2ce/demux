import { AbstractActionReader, BaseActionWatcher, BlockInfo, IndexingStatus } from "demux";
import { MassiveActionHandler } from "demux-postgres";

export class GxcActionWatcher extends BaseActionWatcher {
   protected actionReader: AbstractActionReader;
   protected actionHandler: MassiveActionHandler;
   protected pollInterval: number;

   constructor(actionReader: AbstractActionReader,
               actionHandler: MassiveActionHandler,
               pollInterval: number = parseInt(process.env.DEMUX_POLLINTERVAL, 10)) {
      super(actionReader, actionHandler, pollInterval);
   }
}
