import { CommandBase } from '@building-blocks/application';

export class ConfirmUserRegistrationCommand extends CommandBase {
  constructor(readonly userRegistrationId: string) {
    super();
  }
}
