import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigService } from "./config/config.service";
import { LoggerService } from "./common/logger/logger.service";
import { DirectoryModule } from "./modules/directory/directory.module";

@Module({
  imports: [DirectoryModule],
  controllers: [AppController],
  providers: [AppService, ConfigService, LoggerService],
})
export class AppModule {}
