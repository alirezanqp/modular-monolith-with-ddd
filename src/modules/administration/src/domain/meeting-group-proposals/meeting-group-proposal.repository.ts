import { MeetingGroupProposal } from './meeting-group-proposal';
import { MeetingGroupProposalId } from './meeting-group-proposal-id';

export interface IMeetingGroupProposalRepository {
  add(proposal: MeetingGroupProposal): Promise<void>;
  update(proposal: MeetingGroupProposal): Promise<void>;
  getById(id: MeetingGroupProposalId): Promise<MeetingGroupProposal | null>;
}
