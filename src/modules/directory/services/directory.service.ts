import { Injectable } from "@nestjs/common";
import { spawn } from "child_process";
import path from "path";
import * as fs from "fs/promises";
import { STRING_CONSTANTS } from "src/common/constants/string.constants";
import { LoggerService } from "src/common/logger/logger.service";
import { APP_CONSTANTS } from "src/common/constants/app.constants";

@Injectable()
export class DirectoryService {
  constructor(private readonly logger: LoggerService) {}

  async listDirectories(): Promise<{ name: string; isDirectory: boolean }[]> {
    const mountPath = APP_CONSTANTS.MOUNT_POINT;
    try {
      this.logger.info(`Listing directories in path: ${mountPath}`);
      if (!mountPath || typeof mountPath !== "string") {
        throw new Error("Invalid network path");
      }
      const files = await fs.readdir(mountPath, { withFileTypes: true });
      const items = files.map((file) => ({
        name: file.name,
        isDirectory: file.isDirectory(),
      }));
      return items;
    } catch (error) {
      this.logger.error(`Error listing directories in path: ${mountPath}`, {
        error: error.message,
      });
      this.logger.error(STRING_CONSTANTS.ERRORS.READ_DIRECTORIES, {
        error: error.message,
      });
      throw error;
    }
  }

  async listFilesByExtension(): Promise<string[]> {
    const mountPath = APP_CONSTANTS.MOUNT_POINT;
    const extension = APP_CONSTANTS.FILE_EXTENSION;

    try {
      const files = await fs.readdir(mountPath, { withFileTypes: true });
      const matchingFiles = files
        .filter(
          (file) =>
            file.isFile() &&
            path.extname(file.name).slice(1).toLowerCase() ===
              extension.toLowerCase(),
        )
        .map((file) => path.join(mountPath, file.name)); // Use path.join
      return matchingFiles;
    } catch (error) {
      this.logger.error(
        `Error listing files with extension '${extension}' in path: ${mountPath}`,
        { error: error.message },
      );
      this.logger.error(STRING_CONSTANTS.ERRORS.READ_FILES_BY_EXTENSION, {
        error: error.message,
      });
      throw new Error(
        `${STRING_CONSTANTS.ERRORS.FAILED_TO_LIST_FILES}: ${error.message}`,
      );
    }
  }

  async mountNetworkDirectory(
    networkPath: string,
    username: string,
    password: string,
  ): Promise<void> {
    const mountPoint = APP_CONSTANTS.MOUNT_POINT;
    this.logger.info(
      `Mounting network directory at path: ${networkPath} to mount point: ${mountPoint}`,
    );
    if (!networkPath || typeof networkPath !== "string") {
      throw new Error("Invalid network path");
    }
    if (!mountPoint || typeof mountPoint !== "string") {
      throw new Error("Invalid mount point");
    }
    if (!username || !password) {
      throw new Error(
        "Username or password is not set in environment variables",
      );
    }
    return new Promise((resolve, reject) => {
      const mountArgs = [
        "-t",
        "cifs",
        networkPath,
        mountPoint,
        `username=${username},password=${password}`,
      ];
      const mountProcess = spawn("sudo", ["mount", ...mountArgs]);
      mountProcess.on("error", (error) => {
        this.logger.error(
          `Error mounting network directory at path: ${networkPath} to mount point: ${mountPoint}`,
          { error: error.message },
        );
        this.logger.error(STRING_CONSTANTS.ERRORS.FAILED_TO_MOUNT, {
          error: error.message,
        });
        reject(new Error(STRING_CONSTANTS.ERRORS.FAILED_TO_MOUNT));
      });
      mountProcess.on("close", (code) => {
        if (code === 0) {
          this.logger.info(
            `Successfully mounted network directory at path: ${networkPath} to mount point: ${mountPoint}`,
          );
          this.logger.info(STRING_CONSTANTS.SUCCESS.MOUNT_SUCCESS, {
            mountPoint,
          });
          resolve();
        } else {
          this.logger.error(
            `Failed to mount network directory at path: ${networkPath} to mount point: ${mountPoint}`,
            { code },
          );
          this.logger.error(STRING_CONSTANTS.ERRORS.FAILED_TO_MOUNT, { code });
          reject(new Error(STRING_CONSTANTS.ERRORS.FAILED_TO_MOUNT));
        }
      });
    });
  }

  async unmountNetworkDirectory(): Promise<void> {
    const mountPoint = APP_CONSTANTS.MOUNT_POINT;

    this.logger.info(
      `Unmounting network directory at mount point: ${mountPoint}`,
    );
    return new Promise((resolve, reject) => {
      const unmountProcess = spawn("sudo", ["umount", mountPoint]);
      unmountProcess.on("error", (error) => {
        this.logger.error(
          `Error unmounting network directory at mount point: ${mountPoint}`,
          { error: error.message },
        );
        this.logger.error(STRING_CONSTANTS.ERRORS.FAILED_TO_UNMOUNT, {
          error: error.message,
        });
        reject(new Error(STRING_CONSTANTS.ERRORS.FAILED_TO_UNMOUNT));
      });
      unmountProcess.on("close", (code) => {
        if (code === 0) {
          this.logger.info(
            `Successfully unmounted network directory at mount point: ${mountPoint}`,
          );
          this.logger.info(STRING_CONSTANTS.SUCCESS.UNMOUNT_SUCCESS, {
            mountPoint,
          });
          resolve();
        } else {
          this.logger.error(
            `Failed to unmount network directory at mount point: ${mountPoint}`,
            { code },
          );
          this.logger.error(STRING_CONSTANTS.ERRORS.FAILED_TO_UNMOUNT, {
            code,
          });
          reject(new Error(STRING_CONSTANTS.ERRORS.FAILED_TO_UNMOUNT));
        }
      });
    });
  }
}
