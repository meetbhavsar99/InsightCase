import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CaseService } from './case.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Status } from '@prisma/client';

@ApiTags('Case')
// @UseGuards(JwtAuthGuard)
@Controller('case')
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  // @Get(':id')
  // // @UseGuards(CaseAccessGuard)
  // getCaseById(@Param('id') id: string) {
  //   return this.caseService.findCaseById(id);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all cases with optional status filtering' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter cases by status (OPEN, ONGOING, CLOSED)',
  })
  async getAllCases(@Query('status') status?: Status) {
    return await this.caseService.getAllCases(status);
  }

  @Post()
  createCase(@Body() dto: CreateCaseDto, @Req() req: Request) {
    return this.caseService.createCase(dto, req);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a case status and tasks',
    description:
      'Allows updating the status of a case and marking tasks as completed or not completed.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Case updated successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Case or task not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  async updateCase(@Param('id') caseId: string, @Body() dto: UpdateCaseDto, @Req() req: Request) {
    return await this.caseService.updateCase(caseId, dto, req);
  }

  @Get('events')
  async getCalendarEvents(@Req() req: Request) {
    try {
      return await this.caseService.fetchAndFormatCalendarEvents(req);
    } catch (err) {
      return {
        error: 'Failed to fetch calendar events',
        message: err.message,
      };
    }
  }

  @Delete(':id')
  async deleteCase(@Param('id') id: string, @Req() req: Request) {
    return this.caseService.deleteCase(id, req);
  }
}
