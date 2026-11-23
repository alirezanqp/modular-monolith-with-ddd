import { CommandBaseWithResult } from '@building-blocks/application';
export class ProposeMeetingGroupCommand extends CommandBaseWithResult<string> {
  constructor(readonly name: string, readonly description: string, readonly locationCity: string, readonly locationCountryCode: string, readonly proposalUserId: string) { super(); }
}