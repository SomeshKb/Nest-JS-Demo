import { Test, TestingModule } from "@nestjs/testing";
import { DirectoryController } from "./directory.controller";
import { DirectoryService } from "../services/directory.service";

describe("DirectoryController", () => {
  let controller: DirectoryController;
  let service: DirectoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectoryController],
      providers: [
        {
          provide: DirectoryService,
          useValue: {
            listDirectories: jest.fn(),
            listFilesByExtension: jest.fn(),
            mountNetworkDirectory: jest.fn(),
            unmountNetworkDirectory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DirectoryController>(DirectoryController);
    service = module.get<DirectoryService>(DirectoryService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return directories", async () => {
    jest
      .spyOn(service, "listDirectories")
      .mockResolvedValue([{ name: "dir1", isDirectory: true }]);

    const result = await controller.listDirectories();
    expect(result).toEqual({ data: [{ name: "dir1", isDirectory: true }] });
  });

  it("should return files by extension", async () => {
    jest
      .spyOn(service, "listFilesByExtension")
      .mockResolvedValue(["/mock/path/file1.txt"]);

    const result = await controller.listFilesByExtension();
    expect(result).toEqual({ data: ["/mock/path/file1.txt"] });
  });

  it("should call mountNetworkDirectory", async () => {
    const body = {
      networkPath: "mockPath",
      username: "mockUser",
      password: "mockPass",
    };
    await controller.mountNetworkDirectory(body);
    expect(service.mountNetworkDirectory).toHaveBeenCalledWith(
      "mockPath",
      "mockUser",
      "mockPass",
    );
  });

  it("should call unmountNetworkDirectory", async () => {
    await controller.unmountNetworkDirectory();
    expect(service.unmountNetworkDirectory).toHaveBeenCalled();
  });
});
