import { CommandBaseWithResult } from '@building-blocks/application';
export class CreateMeetingCommand extends CommandBaseWithResult<string> {
  constructor(
    readonly meetingGroupId: string, readonly title: string, readonly termStartDate: Date, readonly termEndDate: Date,
    readonly description: string, readonly locationName: string, readonly locationAddress: string,
    readonly locationPostalCode: string, readonly locationCity: string, readonly attendeesLimit: number | null,
    readonly guestsLimit: number, readonly rsvpTermStartDate: Date | null, readonly rsvpTermEndDate: Date | null,
    readonly eventFeeValue: number | null, readonly eventFeeCurrency: string | null, readonly hostMemberIds: string[],
    readonly creatorId: string,
  ) { super(); }
}