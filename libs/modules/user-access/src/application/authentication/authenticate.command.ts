import { CommandBaseWithResult } from '@building-blocks/application';

export interface AuthenticationClaim {
  type: string;
  value: string;
}

export interface AuthenticatedUserDto {
  id: string;
  login: string;
  name: string;
  email: string;
  claims: AuthenticationClaim[];
}

export interface AuthenticationResult {
  isAuthenticated: boolean;
  authenticationError?: string;
  user?: AuthenticatedUserDto;
}

export class AuthenticateCommand extends CommandBaseWithResult<AuthenticationResult> {
  constructor(
    readonly login: string,
    readonly password: string,
  ) {
    super();
  }
}
