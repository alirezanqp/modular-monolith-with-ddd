import { IntegrationEvent } from '@building-blocks/infrastructure';

export class MeetingAttendeeAddedIntegrationEvent extends IntegrationEvent {
  constructor(
    public readonly meetingId: string,
    public readonly attendeeId: string,
    public readonly feeValue: number | null,
    public readonly feeCurrency: string | null,
    id?: string,
    occurredOn?: Date,
  ) {
    super(id, occurredOn);
  }
}
