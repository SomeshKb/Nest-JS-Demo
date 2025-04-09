import { HttpExceptionFilter } from "./http-exception.filter";
import { LoggerService } from "../logger/logger.service";
import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = new LoggerService();
    jest.spyOn(loggerService, "error").mockImplementation(() => {});
    jest.spyOn(loggerService, "warn").mockImplementation(() => {});
    filter = new HttpExceptionFilter(loggerService);
  });

  it("should log and format a 500 error response", () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = { url: "/test" };
    const mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exception = new Error("Test error");

    filter.catch(exception, mockHost);

    expect(loggerService.error).toHaveBeenCalledWith("Exception caught", {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      path: "/test",
      stack: exception.stack,
    });

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      path: "/test",
      message: "Internal server error",
    });
  });

  it("should log and format a 400 error response", () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = { url: "/test" };
    const mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exception = new HttpException("Bad Request", HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(loggerService.warn).toHaveBeenCalledWith("Exception caught", {
      status: HttpStatus.BAD_REQUEST,
      message: "Bad Request",
      path: "/test",
    });

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      path: "/test",
      message: "Bad Request",
    });
  });
});
