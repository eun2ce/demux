import { MigrationRunner, Migration } from "demux-postgres";
import { IDatabase } from 'pg-promise'

export class GxcMigrationRunner extends MigrationRunner {
   constructor(protected pgp: IDatabase<{}>,
    protected migrations: Migration[],
    protected schemaName: string = 'public',
    skipSetup = false,){
      super(pgp,migrations, schemaName, skipSetup)
   }
}
