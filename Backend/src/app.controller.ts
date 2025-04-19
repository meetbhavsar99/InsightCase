import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './shared/guards/auth.guard';

@ApiTags('Testing')
@Controller()
@ApiBearerAuth()
// @UseGuards(AuthGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // @UseGuards(JwtAuthGuard)
  getHello(): string {
    return this.appService.getHello();
  }
}
