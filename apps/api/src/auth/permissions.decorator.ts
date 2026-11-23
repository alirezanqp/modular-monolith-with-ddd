import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from './permissions';

export const PERMISSIONS_KEY = 'permissions';

export const HasPermission = (...permissions: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
