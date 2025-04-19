import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Developers! Go to /api route to access api documentation.';
  }
}
