import { BusinessRuleValidationException } from '@building-blocks/domain';
import { UserRegistration } from './user-registration';
import { UserRegistrationId } from './user-registration-id';
import { UserRegistrationStatus } from './user-registration-status';

describe('UserRegistration', () => {
  it('registers a new user waiting for confirmation', () => {
    const registration = UserRegistration.registerNewUser(
      new UserRegistrationId('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
      'john@mail.com',
      'hash',
      'john@mail.com',
      'John',
      'Doe',
    );

    expect(registration.getStatusCode()).toBe(UserRegistrationStatus.WaitingForConfirmation);
    expect(registration.domainEvents).toHaveLength(1);
  });

  it('confirms registration once', () => {
    const registration = UserRegistration.registerNewUser(
      new UserRegistrationId('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
      'john@mail.com',
      'hash',
      'john@mail.com',
      'John',
      'Doe',
    );
    registration.clearDomainEvents();
    registration.confirm();

    expect(registration.getStatusCode()).toBe(UserRegistrationStatus.Confirmed);
    expect(registration.getConfirmedDate()).not.toBeNull();
    expect(() => registration.confirm()).toThrow(BusinessRuleValidationException);
  });
});
