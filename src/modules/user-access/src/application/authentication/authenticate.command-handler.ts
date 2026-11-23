import { ICommandHandlerWithResult } from '@building-blocks/application';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../users/user.repository';
import { AuthenticateCommand, AuthenticationResult } from './authenticate.command';

export class AuthenticateCommandHandler
  implements ICommandHandlerWithResult<AuthenticateCommand, AuthenticationResult>
{
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(command: AuthenticateCommand): Promise<AuthenticationResult> {
    const user = await this.userRepository.findByLogin(command.login);
    if (!user) {
      return {
        isAuthenticated: false,
        authenticationError: 'Incorrect login or password',
      };
    }

    if (!user.getIsActive()) {
      return {
        isAuthenticated: false,
        authenticationError: 'User is not active',
      };
    }

    const matches = await bcrypt.compare(command.password, user.getPassword());
    if (!matches) {
      return {
        isAuthenticated: false,
        authenticationError: 'Incorrect login or password',
      };
    }

    return {
      isAuthenticated: true,
      user: {
        id: user.id.value,
        login: user.getLogin(),
        name: user.getName(),
        email: user.getEmail(),
        claims: [
          { type: 'name', value: user.getName() },
          { type: 'email', value: user.getEmail() },
          { type: 'login', value: user.getLogin() },
        ],
      },
    };
  }
}
