import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { ExecutionContextAccessor } from '@building-blocks/application';
import { JwtPayload } from '../auth/jwt.strategy';
import { executionContextStorage } from './request-execution-context';

@Injectable()
export class ExecutionContextMiddleware implements NestMiddleware {
  use(req: Request & { user?: JwtPayload }, _res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID();
    const userId = req.user?.sub ?? null;
    const accessor = new ExecutionContextAccessor(userId, correlationId);
    executionContextStorage.run(accessor, () => next());
  }
}
