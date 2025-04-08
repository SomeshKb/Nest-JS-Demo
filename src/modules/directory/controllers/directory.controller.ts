import { Controller, Get, Post, Query, Body } from "@nestjs/common";
import { MountNetworkDirectoryDto } from "../dto/mount-network-directory.dto";
import { DirectoryService } from "../services/directory.service";

@Controller("directory")
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  @Get()
  async listDirectories(@Query("path") path: string) {
    return this.directoryService.listDirectories(path);
  }

  @Get("files")
  async listFilesByExtension(
    @Query("path") path: string,
    @Query("extension") extension: string,
  ) {
    return this.directoryService.listFilesByExtension(path, extension);
  }

  @Post("mount")
  async mountNetworkDirectory(@Body() body: MountNetworkDirectoryDto) {
    return this.directoryService.mountNetworkDirectory(
      body.networkPath,
      body.username,
      body.password,
      body.mountPoint,
    );
  }

  @Post("unmount")
  async unmountNetworkDirectory(@Body("mountPoint") mountPoint: string) {
    return this.directoryService.unmountNetworkDirectory(mountPoint);
  }
}
