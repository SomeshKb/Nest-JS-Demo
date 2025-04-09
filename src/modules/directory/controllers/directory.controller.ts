import { Controller, Get, Post, Body, HttpCode } from "@nestjs/common";
import { MountNetworkDirectoryDto } from "../dto/mount-network-directory.dto";
import { DirectoryService } from "../services/directory.service";

@Controller("directory")
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  @Get()
  async listDirectories() {
    return { data: await this.directoryService.listDirectories() };
  }

  @Get("files")
  async listFilesByExtension() {
    return { data: await this.directoryService.listFilesByExtension() };
  }

  @Post("mount")
  @HttpCode(204)
  async mountNetworkDirectory(@Body() body: MountNetworkDirectoryDto) {
    await this.directoryService.mountNetworkDirectory(
      body.networkPath,
      body.username,
      body.password,
    );
  }

  @Post("unmount")
  @HttpCode(204)
  async unmountNetworkDirectory() {
    await this.directoryService.unmountNetworkDirectory();
  }
}
