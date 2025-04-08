import { Injectable } from "@nestjs/common";
import { spawn } from "child_process";
import path from "path";
import * as fs from "fs/promises";
import { STRING_CONSTANTS } from "src/common/constants/string.constants";
import { LoggerService } from "src/common/logger/logger.service";

@Injectable()
export class DirectoryService {
  constructor(private readonly logger: LoggerService) {}

  async listDirectories(
    networkPath: string,
  ): Promise<{ name: string; isDirectory: boolean }[]> {
    try {
      if (!networkPath) {
        throw new Error(STRING_CONSTANTS.ERRORS.PATH_UNDEFINED);
      }
      const files = await fs.readdir(networkPath, { withFileTypes: true });
      const items = files.map((file) => ({
        name: file.name,
        isDirectory: file.isDirectory(),
      }));
      return items;
    } catch (error) {
      this.logger.error(STRING_CONSTANTS.ERRORS.READ_DIRECTORIES, {
        error: error.message,
      });
      throw error;
    }
  }

  async listFilesByExtension(
    networkPath: string,
    extension: string,
  ): Promise<string[]> {
    try {
      const files = await fs.readdir(networkPath, { withFileTypes: true });
      const matchingFiles = files
        .filter(
          (file) =>
            file.isFile() && path.extname(file.name).slice(1) === extension,
        )
        .map((file) => file.name);
      return matchingFiles;
    } catch (error) {
      this.logger.error(STRING_CONSTANTS.ERRORS.READ_FILES_BY_EXTENSION, {
        error: error.message,
      });
      throw new Error(STRING_CONSTANTS.ERRORS.FAILED_TO_LIST_FILES);
    }
  }

  async mountNetworkDirectory(
    networkPath: string,
    username: string,
    password: string,
    mountPoint: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const mountArgs = [
        "-t",
        "cifs",
        networkPath,
        mountPoint,
        "-o",
        `username=${username},password=${password}`,
      ];
      const mountProcess = spawn("sudo", ["mount", ...mountArgs]);

      mountProcess.on("error", (error) => {
        this.logger.error(STRING_CONSTANTS.ERRORS.FAILED_TO_MOUNT, {
          error: error.message,
        });
        reject(new Error(STRING_CONSTANTS.ERRORS.FAILED_TO_MOUNT));
      });
      mountProcess.on("close", (code) => {
        if (code === 0) {
          this.logger.info(STRING_CONSTANTS.SUCCESS.MOUNT_SUCCESS, {
            mountPoint,
          });
          resolve();
        } else {
          this.logger.error(STRING_CONSTANTS.ERRORS.FAILED_TO_MOUNT, { code });
          reject(new Error(STRING_CONSTANTS.ERRORS.FAILED_TO_MOUNT));
        }
      });
    });
  }

  async unmountNetworkDirectory(mountPoint: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const unmountProcess = spawn("sudo", ["umount", mountPoint]);

      unmountProcess.on("error", (error) => {
        this.logger.error(STRING_CONSTANTS.ERRORS.FAILED_TO_UNMOUNT, {
          error: error.message,
        });
        reject(new Error(STRING_CONSTANTS.ERRORS.FAILED_TO_UNMOUNT));
      });
      unmountProcess.on("close", (code) => {
        if (code === 0) {
          this.logger.info(STRING_CONSTANTS.SUCCESS.UNMOUNT_SUCCESS, {
            mountPoint,
          });
          resolve();
        } else {
          this.logger.error(STRING_CONSTANTS.ERRORS.FAILED_TO_UNMOUNT, {
            code,
          });
          reject(new Error(STRING_CONSTANTS.ERRORS.FAILED_TO_UNMOUNT));
        }
      });
    });
  }
}
