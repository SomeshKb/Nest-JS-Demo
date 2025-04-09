import { LoggerService } from "../logger/logger.service";
import { CustomError } from "../errors/custom-error";

export class ErrorUtil {
  static logAndThrowError(
    logger: LoggerService,
    message: string,
    error: any,
    context?: string,
  ): never {
    logger.error(message, { error: error.message, context });
    throw new CustomError(`${message}: ${error.message}`);
  }
}
