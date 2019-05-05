import { HandlerVersion } from "demux";
import { MassiveActionHandler, MigrationSequence } from "demux-postgres";
import { massive } from "massive";

export class MassiveGxcActionHandler extends MassiveActionHandler {

  constructor(
    protected handlerVersions: HandlerVersion[],
    protected massiveInstance: massive.Database,
    protected dbSchema: string = 'public',
    protected migrationSequences: MigrationSequence[] = [],
  ) {
    super(handlerVersions, massiveInstance, dbSchema, migrationSequences)
  }

  protected matchActionType(candidateType: string, subscribedType: string): boolean {
    const [ candidateContract, candidateAction ] = candidateType.split('::')
    const [ subscribedContract, subscribedAction ] = subscribedType.split('::')
    const contractsMatch = candidateContract === subscribedContract || subscribedContract === '*'
    const actionsMatch = candidateAction === subscribedAction || subscribedAction === '*'
    return contractsMatch && actionsMatch
  }
   public reset() {
    this.lastProcessedBlockNumber = 0
    this.lastProcessedBlockHash = ''
    this.handlerVersionName = 'v1'
  }
  public async _loadIndexState() {
    return await this.loadIndexState()
  }
  public _getCyanAuditStatus() {
    return this.cyanauditEnabled
  }
}
