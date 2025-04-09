import { Injectable } from "@nestjs/common";
import { spawn } from "child_process";
import path from "path";
import * as fs from "fs/promises";
import { LoggerService } from "src/common/logger/logger.service";
import { CustomError } from "src/common/errors/custom-error";
import { ErrorUtil } from "src/common/utils/error.util";
import { ErrorMessages } from "src/common/constants/string.constants";
import { ConfigService } from "src/config/config.service";

@Injectable()
export class DirectoryService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  async listDirectories(): Promise<{ name: string; isDirectory: boolean }[]> {
    const mountPath = this.configService.get("MOUNT_POINT");

    if (!mountPath || typeof mountPath !== "string") {
      throw new CustomError(ErrorMessages.PATH_UNDEFINED);
    }

    try {
      this.logger.info(`Listing directories in path: ${mountPath}`);
      const files = await fs.readdir(mountPath, { withFileTypes: true });
      return files.map((file) => ({
        name: file.name,
        isDirectory: file.isDirectory(),
      }));
    } catch (error) {
      ErrorUtil.logAndThrowError(
        this.logger,
        ErrorMessages.READ_DIRECTORIES,
        error,
        mountPath,
      );
    }
  }

  async listFilesByExtension(): Promise<string[]> {
    const mountPath = this.configService.get("MOUNT_POINT");
    const extension = this.configService.get("FILE_EXTENSION");

    if (!mountPath || !extension) {
      throw new CustomError(ErrorMessages.PATH_UNDEFINED);
    }

    try {
      const files = await fs.readdir(mountPath, { withFileTypes: true });
      return files
        .filter(
          (file) =>
            file.isFile() &&
            path.extname(file.name).slice(1).toLowerCase() ===
              extension.toLowerCase(),
        )
        .map((file) => path.join(mountPath, file.name));
    } catch (error) {
      ErrorUtil.logAndThrowError(
        this.logger,
        ErrorMessages.READ_FILES_BY_EXTENSION,
        error,
        mountPath,
      );
    }
  }

  async mountNetworkDirectory(
    networkPath: string,
    username: string,
    password: string,
  ): Promise<void> {
    const mountPoint = this.configService.get("MOUNT_POINT");

    if (!networkPath || !mountPoint || !username || !password) {
      throw new CustomError(ErrorMessages.PATH_UNDEFINED);
    }

    this.logger.info(
      `Mounting network directory at path: ${networkPath} to mount point: ${mountPoint}`,
    );

    await this.executeCommand("mount", [
      "-t",
      "cifs",
      networkPath,
      mountPoint,
      `username=${username},password=${password}`,
    ]);
  }

  async unmountNetworkDirectory(): Promise<void> {
    const mountPoint = this.configService.get("MOUNT_POINT");

    if (!mountPoint) {
      throw new CustomError(ErrorMessages.PATH_UNDEFINED);
    }

    this.logger.info(
      `Unmounting network directory at mount point: ${mountPoint}`,
    );
    await this.executeCommand("umount", [mountPoint]);
  }

  private async executeCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn("sudo", [command, ...args]);

      process.on("error", (error) => {
        this.logger.error(`Error executing command: ${command}`, {
          error: error.message,
        });
        reject(new CustomError(ErrorMessages.FAILED_TO_MOUNT));
      });

      process.on("close", (code) => {
        if (code === 0) {
          this.logger.info(`Command executed successfully: ${command}`);
          resolve();
        } else {
          this.logger.error(`Command failed with code: ${code}`, { code });
          reject(new CustomError(ErrorMessages.FAILED_TO_MOUNT));
        }
      });
    });
  }
}
