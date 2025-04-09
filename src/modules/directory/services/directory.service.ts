import { Injectable } from "@nestjs/common";
import { spawn } from "child_process";
import path from "path";
import * as fs from "fs/promises";
import { LoggerService } from "src/common/logger/logger.service";
import { CustomError } from "src/common/errors/custom-error";
import { ErrorUtil } from "src/common/utils/error.util";
import { ConfigService } from "src/config/config.service";
import { ResponseData } from "src/common/types/response-data.type";
import { DirectoryEntry } from "../types/directory.types";
import {
  ErrorMessages,
  SuccessMessages,
} from "src/common/constants/status-messages.constants";

@Injectable()
export class DirectoryService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  async listDirectories(): Promise<DirectoryEntry[]> {
    const mountPath = this.configService.get("MOUNT_POINT");

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
  ): Promise<ResponseData> {
    const mountPoint = this.configService.get("MOUNT_POINT");

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

    return { data: null, message: SuccessMessages.MOUNT_SUCCESS };
  }

  async unmountNetworkDirectory(): Promise<ResponseData> {
    const mountPoint = this.configService.get("MOUNT_POINT");

    this.logger.info(
      `Unmounting network directory at mount point: ${mountPoint}`,
    );

    await this.executeCommand("umount", [mountPoint]);

    return { data: null, message: SuccessMessages.UNMOUNT_SUCCESS };
  }

  private async executeCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn("sudo", [command, ...args]);

      process.on("error", (error) => {
        const errorMessage =
          command === "mount"
            ? ErrorMessages.FAILED_TO_MOUNT
            : command === "umount"
              ? ErrorMessages.FAILED_TO_UNMOUNT
              : ErrorMessages.COMMAND_EXECUTION_FAILED;

        this.logger.error(`Error executing command: ${command}`, {
          error: error.message,
        });
        reject(new CustomError(errorMessage));
      });

      process.on("close", (code) => {
        if (code === 0) {
          this.logger.info(`Command executed successfully: ${command}`);
          resolve();
        } else {
          const errorMessage =
            command === "mount"
              ? ErrorMessages.FAILED_TO_MOUNT
              : ErrorMessages.FAILED_TO_UNMOUNT;

          this.logger.error(`Command failed with code: ${code}`, { code });
          reject(new CustomError(errorMessage));
        }
      });
    });
  }
}
