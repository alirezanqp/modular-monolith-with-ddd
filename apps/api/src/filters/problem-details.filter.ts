import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessRuleValidationException } from '@building-blocks/domain';
import { InvalidCommandException } from '@building-blocks/application';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof BusinessRuleValidationException) {
      response.status(HttpStatus.CONFLICT).json({
        type: 'https://httpstatuses.com/409',
        title: 'Business rule broken',
        status: HttpStatus.CONFLICT,
        detail: exception.message,
      });
      return;
    }

    if (exception instanceof InvalidCommandException) {
      response.status(HttpStatus.BAD_REQUEST).json({
        type: 'https://httpstatuses.com/400',
        title: 'Invalid command',
        status: HttpStatus.BAD_REQUEST,
        detail: exception.message,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      response.status(status).json({
        type: `https://httpstatuses.com/${status}`,
        title: exception.name,
        status,
        detail:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : ((exceptionResponse as { message?: string | string[] }).message ?? exception.message),
      });
      return;
    }

    this.logger.error('Unhandled exception', exception as Error);
    const detail =
      process.env.NODE_ENV !== 'production' && exception instanceof Error
        ? exception.message
        : 'An unexpected error occurred';
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail,
    });
  }
}
