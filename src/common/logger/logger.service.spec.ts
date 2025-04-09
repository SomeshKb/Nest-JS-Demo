import { LoggerService } from "./logger.service";

describe("LoggerService", () => {
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = new LoggerService();
  });

  it("should log info messages", () => {
    const spy = jest.spyOn(loggerService["logger"], "info");
    loggerService.info("Test info message");
    expect(spy).toHaveBeenCalledWith("Test info message", undefined);
  });

  it("should log warn messages", () => {
    const spy = jest.spyOn(loggerService["logger"], "warn");
    loggerService.warn("Test warn message");
    expect(spy).toHaveBeenCalledWith("Test warn message", undefined);
  });

  it("should log error messages", () => {
    const spy = jest.spyOn(loggerService["logger"], "error");
    loggerService.error("Test error message");
    expect(spy).toHaveBeenCalledWith("Test error message", undefined);
  });
});
