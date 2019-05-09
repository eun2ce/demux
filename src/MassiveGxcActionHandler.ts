import { HandlerVersion } from "demux";
import { massive, MassiveActionHandler, MigrationSequence, Migration } from "demux-postgres";
import { GxcMigrationRunner } from "./GxcMigrationRunner";
import { IDatabase } from "pg-promise";

export class NonExistentMigrationError extends Error {
  constructor(initSequenceName: string) {
    super(`Migration sequence '${initSequenceName}' does not exist.`)
    Object.setPrototypeOf(this, NonExistentMigrationError.prototype)
  }
}

export class MassiveGxcActionHandler extends MassiveActionHandler {
  constructor(
    protected handlerVersions: HandlerVersion[],
    protected massiveInstance: massive.Database,
    protected dbSchema: string = "gxc",
    protected migrationSequences: MigrationSequence[] = [],
  ) {
     super(handlerVersions, massiveInstance, dbSchema, migrationSequences)
  }
  /**
   * Migrates the database by the given sequenceName. There must be a `MigrationSequence` with this name, or this will
   * throw an error.
   *
   * @param sequenceName  The name of the MigrationSequence to be run.
   */
  public async migrate(
    sequenceName: string,
    pgp: IDatabase<{}> = this.massiveInstance.instance,
    initial: boolean = false,
  ): Promise<void> {
    const migrationSequence = this.migrationSequenceByName[sequenceName]
    if (!migrationSequence) {
      throw new NonExistentMigrationError(sequenceName)
    }
    let ranMigrations: Migration[] = []
    if (!initial) {
      ranMigrations = await this.loadRanMigrations()
    }
    const extendedMigrations = ranMigrations.concat(migrationSequence.migrations)
     const migrationRunner = new GxcMigrationRunner(this.massiveInstance.instance, extendedMigrations, this.dbSchema, true)
    await migrationRunner.migrate(
      migrationSequence.sequenceName,
      this.lastProcessedBlockNumber + 1,
      pgp,
      initial,
    )
    await this.massiveInstance.reload()
  }


     /**
   * Matches wildcards in subscriptions for both the contract name and action type
   *
   * @param candidateType   The incoming action's type
   * @param subscribedType  The type the Updater of Effect is subscribed to
   */
  protected matchActionType(candidateType: string, subscribedType: string): boolean {
    const [ candidateContract, candidateAction ] = candidateType.split('::')
    const [ subscribedContract, subscribedAction ] = subscribedType.split('::')
    const contractsMatch = candidateContract === subscribedContract || subscribedContract === '*'
    const actionsMatch = candidateAction === subscribedAction || subscribedAction === '*'
    return contractsMatch && actionsMatch
  }
}
