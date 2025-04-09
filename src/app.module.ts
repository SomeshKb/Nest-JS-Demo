import { Module } from "@nestjs/common";
import { ConfigService } from "./config/config.service";
import { LoggerService } from "./common/logger/logger.service";
import { DirectoryModule } from "./modules/directory/directory.module";

@Module({
  imports: [DirectoryModule],
  controllers: [],
  providers: [ConfigService, LoggerService],
})
export class AppModule {}
