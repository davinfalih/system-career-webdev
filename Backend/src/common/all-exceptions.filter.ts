import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as any)?.message ?? exception.message
        : (exception as Error)?.message ?? 'Internal server error';

    const path = request?.url ?? 'unknown';

    this.logger.error(
      `Request ${request?.method ?? '?'} ${path} -> ${status}: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (request?.route?.path?.startsWith('/api/') || path.startsWith('/api/')) {
      response.status(status).json({
        statusCode: status,
        message:
          typeof message === 'string'
            ? message
            : Array.isArray(message)
              ? message.join(', ')
              : 'Terjadi kesalahan',
        error: HttpStatus[status] ?? 'Error',
        path,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        message:
          typeof message === 'string'
            ? message
            : Array.isArray(message)
              ? message.join(', ')
              : 'Terjadi kesalahan',
        error: HttpStatus[status] ?? 'Error',
      });
    }
  }
}
