import { Module } from "@nestjs/common";
import { DirectoryController } from "./controllers/directory.controller";
import { LoggerService } from "src/common/logger/logger.service";
import { DirectoryService } from "./services/directory.service";

@Module({
  controllers: [DirectoryController],
  providers: [DirectoryService, LoggerService],
})
export class DirectoryModule {}
