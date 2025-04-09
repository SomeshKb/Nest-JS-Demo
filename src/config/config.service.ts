import { Injectable } from "@nestjs/common";
import { createLogger, format, transports } from "winston";
import { APP_CONSTANTS } from "../common/constants/app.constants";

@Injectable()
export class ConfigService {
  private readonly logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()],
  });

  constructor() {
    this.validateEnvironmentVariables();
  }

  private validateEnvironmentVariables(): void {
    const requiredVariables = ["MOUNT_POINT", "FILE_EXTENSION", "PORT"];
    requiredVariables.forEach((key) => {
      if (!process.env[key]) {
        this.logger.warn(`Environment variable "${key}" is not set.`);
      }
    });
  }

  get(key: string, defaultValue?: string): string {
    switch (key) {
      case "MOUNT_POINT":
        return process.env[key] || APP_CONSTANTS.MOUNT_POINT;
      case "FILE_EXTENSION":
        return process.env[key] || APP_CONSTANTS.FILE_EXTENSION;
      default:
        return process.env[key] || defaultValue || "";
    }
  }
}
