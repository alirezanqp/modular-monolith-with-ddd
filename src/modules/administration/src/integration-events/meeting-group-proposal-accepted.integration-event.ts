import { IntegrationEvent } from '@building-blocks/infrastructure';

export class MeetingGroupProposalAcceptedIntegrationEvent extends IntegrationEvent {
  constructor(
    public readonly meetingGroupProposalId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly locationCity: string,
    public readonly locationCountryCode: string,
    public readonly proposalUserId: string,
    id?: string,
    occurredOn?: Date,
  ) {
    super(id, occurredOn);
  }
}
