import { IntegrationEvent } from '@building-blocks/infrastructure';

export class MeetingGroupProposedIntegrationEvent extends IntegrationEvent {
  constructor(
    readonly meetingGroupProposalId: string,
    readonly name: string,
    readonly description: string,
    readonly locationCity: string,
    readonly locationCountryCode: string,
    readonly proposalUserId: string,
    id?: string,
    occurredOn?: Date,
  ) {
    super(id, occurredOn);
  }
}
