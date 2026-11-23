import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { JwtPayload } from './jwt.strategy';

/**
 * Permission guard. When User Access permission lookup is available, replace the
 * permissive fallback below with a real permissions check against the authenticated user.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!request.user) {
      throw new UnauthorizedException();
    }

    // TODO: wire to User Access GetUserPermissions once that module is available.
    // For now, authenticated users pass HasPermission checks so controllers can be exercised.
    const userPermissions: string[] | undefined = (request.user as JwtPayload & {
      permissions?: string[];
    }).permissions;

    if (userPermissions && !required.every((p) => userPermissions.includes(p))) {
      throw new ForbiddenException(`Missing permission(s): ${required.join(', ')}`);
    }

    return true;
  }
}
