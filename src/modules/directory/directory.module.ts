import { Module } from "@nestjs/common";
import { DirectoryController } from "./controllers/directory.controller";
import { LoggerService } from "src/common/logger/logger.service";
import { DirectoryService } from "./services/directory.service";
import { ConfigService } from "src/config/config.service";

@Module({
  controllers: [DirectoryController],
  providers: [DirectoryService, LoggerService, ConfigService],
})
export class DirectoryModule {}
