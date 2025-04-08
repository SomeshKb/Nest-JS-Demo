import { Injectable } from "@nestjs/common";
import { createLogger, format, transports, Logger } from "winston";

@Injectable()
export class LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new transports.Console(),
        new transports.File({ filename: "application.log" }),
      ],
    });
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }
}
