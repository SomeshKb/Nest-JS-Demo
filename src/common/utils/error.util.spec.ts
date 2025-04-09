import { ErrorUtil } from "./error.util";
import { LoggerService } from "../logger/logger.service";
import { CustomError } from "../errors/custom-error";

describe("ErrorUtil", () => {
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = new LoggerService();
    jest.spyOn(loggerService, "error").mockImplementation(() => {});
  });

  it("should log an error and throw a CustomError", () => {
    const message = "Test error message";
    const error = new Error("Test error");
    const context = "TestContext";
    const methodName = "TestMethod";

    expect(() => {
      ErrorUtil.logAndThrowError(
        loggerService,
        message,
        error,
        context,
        methodName,
      );
    }).toThrow(CustomError);

    expect(loggerService.error).toHaveBeenCalledWith(message, {
      error: error.message,
      context,
      methodName,
      params: undefined,
    });
  });
});
