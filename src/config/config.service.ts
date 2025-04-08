import { Injectable } from "@nestjs/common";
import { createLogger, format, transports } from "winston";

@Injectable()
export class ConfigService {
  private readonly logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()],
  });

  get(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    if (!value) {
      this.logger.warn(`Configuration key "${key}" is not set.`);
    }
    return value;
  }
}
