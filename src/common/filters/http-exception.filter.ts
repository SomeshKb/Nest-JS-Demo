import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

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
        ? exception.getResponse()
        : "Internal server error";

    // Log the error with appropriate log level
    if (status >= 500) {
      this.logger.error("Exception caught", {
        status,
        message,
        path: request.url,
        stack: exception instanceof Error ? exception.stack : null,
      });
    } else {
      this.logger.warn("Exception caught", {
        status,
        message,
        path: request.url,
      });
    }

    // Send a formatted error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
