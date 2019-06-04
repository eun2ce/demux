import { ActionReaderOptions } from "demux";

export interface MongoActionReaderOptions extends ActionReaderOptions { // ignore tslint not start interface name I
  mongoEndpoint?: string;
  dbName?: string;
}
