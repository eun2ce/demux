import { ActionReaderOptions } from 'demux';
import { MongoActionReader } from "demux-eos";

export interface MongoActionReaderOptions extends ActionReaderOptions {
  mongoEndpoint?: string
  dbName?: string
}

export class GxcMongoActionReader extends MongoActionReader {
   public dbName: string
   protected mongoEndpoint: string
   protected mongoStartAtBlock: number
   protected onlyIrreversible: boolean

   constructor(options: MongoActionReaderOptions = {}) {
      super(options)
   }
}
