import { ConfigService } from "./config.service";
import { LoggerService } from "../common/logger/logger.service";

describe("ConfigService", () => {
  let configService: ConfigService;
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = new LoggerService();
    jest.spyOn(loggerService, "warn").mockImplementation(() => {});
    configService = new ConfigService(loggerService);
  });

  it("should be defined", () => {
    expect(configService).toBeDefined();
  });

  it("should return default MOUNT_POINT if not set in environment", () => {
    delete process.env.MOUNT_POINT;
    const result = configService.get("MOUNT_POINT");
    expect(result).toBe("./");
  });

  it("should return default FILE_EXTENSION if not set in environment", () => {
    delete process.env.FILE_EXTENSION;
    const result = configService.get("FILE_EXTENSION");
    expect(result).toBe("txt");
  });

  it("should return environment variable value if set", () => {
    process.env.TEST_VAR = "test_value";
    const result = configService.get("TEST_VAR");
    expect(result).toBe("test_value");
  });

  it("should log a warning if required environment variable is not set", () => {
    delete process.env.PORT;
    configService = new ConfigService(loggerService);
    expect(loggerService.warn).toHaveBeenCalledWith(
      'Environment variable "PORT" is not set.',
    );
  });

  it("should return default value if provided and environment variable is not set", () => {
    delete process.env.CUSTOM_VAR;
    const result = configService.get("CUSTOM_VAR", "default_value");
    expect(result).toBe("default_value");
  });
});
