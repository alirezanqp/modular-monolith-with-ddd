import { BusinessRuleValidationException } from '@building-blocks/domain';
import { MeetingGroupLocation } from '../shared/meeting-group-location';
import { MoneyValue } from '../shared/money-value';
import { MeetingGroup } from './meeting-group';

describe('MeetingGroup', () => {
  it('creates a group based on proposal with organizer member', () => {
    const group = MeetingGroup.createBasedOnProposal(
      '11111111-1111-1111-1111-111111111111',
      'DDD Warsaw',
      'Domain Driven Design',
      MeetingGroupLocation.create('Warsaw', 'PL'),
      '22222222-2222-2222-2222-222222222222',
    );

    expect(group.getName()).toBe('DDD Warsaw');
    expect(group.getMembers()).toHaveLength(1);
    expect(group.getMembers()[0].roleCode).toBe('Organizer');
  });

  it('allows joining and leaving the group', () => {
    const creatorId = '22222222-2222-2222-2222-222222222222';
    const memberId = '33333333-3333-3333-3333-333333333333';
    const group = MeetingGroup.createBasedOnProposal(
      '11111111-1111-1111-1111-111111111111',
      'DDD Warsaw',
      'Domain Driven Design',
      MeetingGroupLocation.create('Warsaw', 'PL'),
      creatorId,
    );

    group.joinToGroup(memberId);
    expect(group.getMembers().filter((m) => m.isActive)).toHaveLength(2);

    group.leaveGroup(memberId);
    expect(group.getMembers().filter((m) => m.isActive)).toHaveLength(1);
  });

  it('rejects meeting organization when subscription expired', () => {
    const creatorId = '22222222-2222-2222-2222-222222222222';
    const group = MeetingGroup.createBasedOnProposal(
      '11111111-1111-1111-1111-111111111111',
      'DDD Warsaw',
      'Domain Driven Design',
      MeetingGroupLocation.create('Warsaw', 'PL'),
      creatorId,
    );
    group.setExpirationDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    expect(() =>
      group.createMeeting({
        title: 'Kickoff',
        termStart: new Date(Date.now() + 60_000),
        termEnd: new Date(Date.now() + 3_600_000),
        description: 'First meeting',
        locationName: 'Office',
        locationAddress: 'Main 1',
        locationPostalCode: '00-001',
        locationCity: 'Warsaw',
        attendeesLimit: 10,
        guestsLimit: 0,
        rsvpStart: null,
        rsvpEnd: null,
        eventFee: MoneyValue.free('PLN'),
        hostMemberIds: [],
        creatorId,
      }),
    ).toThrow(BusinessRuleValidationException);
  });
});
