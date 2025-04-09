import { Controller, Get, Post, Body } from "@nestjs/common";
import { MountNetworkDirectoryDto } from "../dto/mount-network-directory.dto";
import { DirectoryService } from "../services/directory.service";

@Controller("directory")
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  @Get()
  async listDirectories() {
    return this.directoryService.listDirectories();
  }

  @Get("files")
  async listFilesByExtension() {
    return this.directoryService.listFilesByExtension();
  }

  @Post("mount")
  async mountNetworkDirectory(@Body() body: MountNetworkDirectoryDto) {
    return this.directoryService.mountNetworkDirectory(
      body.networkPath,
      body.username,
      body.password,
    );
  }

  @Post("unmount")
  async unmountNetworkDirectory() {
    return this.directoryService.unmountNetworkDirectory();
  }
}
