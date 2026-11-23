import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  GetAuthenticatedUserPermissionsQuery,
  GetAuthenticatedUserQuery,
  IUserAccessModule,
} from '@modules/user-access';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtPayload } from '../../auth/jwt.strategy';
import { USER_ACCESS_MODULE } from '../tokens';

@ApiTags('UserAccess')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/userAccess')
export class AuthenticatedUserController {
  constructor(
    @Inject(USER_ACCESS_MODULE) private readonly userAccessModule: IUserAccessModule,
  ) {}

  @Get('authenticatedUser')
  getAuthenticatedUser(@CurrentUser() user: JwtPayload) {
    return this.userAccessModule.executeQuery(new GetAuthenticatedUserQuery(user.sub));
  }

  @Get('authenticatedUser/permissions')
  getPermissions(@CurrentUser() user: JwtPayload) {
    return this.userAccessModule.executeQuery(
      new GetAuthenticatedUserPermissionsQuery(user.sub),
    );
  }
}
