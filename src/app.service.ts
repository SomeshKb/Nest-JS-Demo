import { Injectable } from "@nestjs/common";

const HELLO_MESSAGE = "Hello World!";

@Injectable()
export class AppService {
  getHealth(): string {
    return HELLO_MESSAGE;
  }
}
