import { Test, TestingModule } from "@nestjs/testing";
import { DirectoryService } from "./directory.service";
import * as fs from "fs/promises";
import { LoggerService } from "src/common/logger/logger.service";

jest.mock("fs/promises");

describe("DirectoryService", () => {
  let service: DirectoryService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectoryService, LoggerService],
    }).compile();

    service = module.get<DirectoryService>(DirectoryService);
    logger = module.get<LoggerService>(LoggerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should list directories", async () => {
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
    jest.spyOn(fs, "readdir").mockResolvedValue([
      { name: "file1.txt", isFile: () => true },
      { name: "file2.jpg", isFile: () => true },
    ] as any);

    const result = await service.listFilesByExtension();
    expect(result).toEqual(["./file1.txt"]);
  });

  it("should throw an error if MOUNT_POINT is undefined in listDirectories", async () => {
    jest.spyOn(service["configService"], "get").mockReturnValue("");

    await expect(service.listDirectories()).rejects.toThrow(
      "Path is undefined or null",
    );
  });

  it("should throw an error if readdir fails in listDirectories", async () => {
    jest.spyOn(fs, "readdir").mockRejectedValue(new Error("Mocked error"));

    await expect(service.listDirectories()).rejects.toThrow(
      "Error reading directories: Mocked error",
    );
  });

  it("should throw an error if executeCommand fails in mountNetworkDirectory", async () => {
    jest
      .spyOn(service as any, "executeCommand")
      .mockRejectedValue(new Error("Mocked command error"));

    await expect(
      service.mountNetworkDirectory("networkPath", "username", "password"),
    ).rejects.toThrow("Failed to mount directory");
  });
});
