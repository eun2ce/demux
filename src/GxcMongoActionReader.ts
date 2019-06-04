import { MongoActionReader } from "demux-eos";
import { MongoActionReaderOptions } from "./interfaces";

export class GxcMongoActionReader extends MongoActionReader {
   public dbName: string;
   protected mongoEndpoint: string;
   protected mongoStartAtBlock: number;
   protected onlyIrreversible: boolean;

   constructor(options: MongoActionReaderOptions = {}) {
      super(options);
   }
}
