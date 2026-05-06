import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { MESSAGES } from '../messages';

interface ExceptionPayload {
  message: string | string[];
}

interface ErrorBody {
  data: null;
  message: string;
  statusCode: number;
  errors?: string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = MESSAGES.INTERNAL_ERROR;
    let fieldErrors: string[] | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const responseBody = exception.getResponse();
      const extracted = this.extractFromHttpException(responseBody);
      message = extracted.message;
      fieldErrors = extracted.errors;
    } else if (exception instanceof Error) {
      // Do NOT surface raw error text to clients — log server-side only.
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error(MESSAGES.UNKNOWN_EXCEPTION, JSON.stringify(exception));
    }

    const body: ErrorBody = {
      data: null,
      message,
      statusCode,
    };
    if (fieldErrors && fieldErrors.length > 0) {
      body.errors = fieldErrors;
    }

    response.status(statusCode).json(body);
  }

  private extractFromHttpException(payload: string | object): {
    message: string;
    errors?: string[];
  } {
    if (typeof payload === 'string') return { message: payload };
    if (this.hasMessage(payload)) {
      const value = payload.message;
      if (Array.isArray(value)) {
        return { message: value.join(', '), errors: value };
      }
      if (typeof value === 'string') {
        return { message: value };
      }
    }
    return { message: MESSAGES.ERROR };
  }

  private hasMessage(payload: object): payload is ExceptionPayload {
    return 'message' in payload;
  }
}
