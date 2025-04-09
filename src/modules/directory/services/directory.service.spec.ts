import { Test, TestingModule } from "@nestjs/testing";
import { DirectoryService } from "./directory.service";
import * as fs from "fs/promises";
import { LoggerService } from "../../../common/logger/logger.service";
import { ConfigService } from "../../../config/config.service";
import { ErrorUtil } from "../../../common/utils/error.util";

jest.mock("fs/promises");

describe("DirectoryService", () => {
  let service: DirectoryService;
  let configService: ConfigService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let loggerService: LoggerService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectoryService, LoggerService, ConfigService],
    }).compile();

    service = module.get<DirectoryService>(DirectoryService);
    configService = module.get<ConfigService>(ConfigService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should list directories", async () => {
    jest.spyOn(configService, "get").mockReturnValue("/mock/path");
    jest.spyOn(fs, "readdir").mockResolvedValue([
      { name: "dir1", isDirectory: () => true },
      { name: "file1.txt", isDirectory: () => false },
    ] as any);

    const result = await service.listDirectories();
    expect(result).toEqual([
      { name: "dir1", isDirectory: true },
      { name: "file1.txt", isDirectory: false },
    ]);
  });

  it("should list files by extension", async () => {
    jest.spyOn(configService, "get").mockImplementation((key) => {
      if (key === "MOUNT_POINT") return "/mock/path";
      if (key === "FILE_EXTENSION") return "txt";
      return "";
    });
    jest.spyOn(fs, "readdir").mockResolvedValue([
      { name: "file1.txt", isFile: () => true },
      { name: "file2.jpg", isFile: () => true },
    ] as any);

    const result = await service.listFilesByExtension();
    expect(result).toEqual(["\\mock\\path\\file1.txt"]);
  });

  it("should throw an error if readdir fails in listDirectories", async () => {
    jest.spyOn(configService, "get").mockReturnValue("/mock/path");
    jest.spyOn(fs, "readdir").mockRejectedValue(new Error("Mocked error"));
    jest.spyOn(ErrorUtil, "logAndThrowError").mockImplementation(() => {
      throw new Error("Error reading directories");
    });

    await expect(service.listDirectories()).rejects.toThrow(
      "Error reading directories",
    );
  });

  it("should throw an error if executeCommand fails in mountNetworkDirectory", async () => {
    jest
      .spyOn(service as any, "executeCommand")
      .mockRejectedValue(new Error("Mocked command error"));

    await expect(
      service.mountNetworkDirectory("networkPath", "username", "password"),
    ).rejects.toThrow("Mocked command error");
  });

  it("should unmount network directory successfully", async () => {
    jest.spyOn(service as any, "executeCommand").mockResolvedValue("");

    const result = await service.unmountNetworkDirectory();
    expect(result.message).toBe("Unmounted successfully");
  });
});
