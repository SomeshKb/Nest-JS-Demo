import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "./config/config.service";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggerService } from "./common/logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);

  // Set global prefix for all routes
  app.setGlobalPrefix("api");

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(loggerService));

  const port = parseInt(configService.get("PORT", "3000"), 10);
  await app.listen(port);
}
bootstrap();
