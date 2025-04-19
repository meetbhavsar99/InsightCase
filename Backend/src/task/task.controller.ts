import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  getallTasks() {
    return this.taskService.getAllTasks();
  }

  @Get(':id')
  getTask(@Param('id') id: string) {
    return this.taskService.getTask(id);
  }

  @Get('user/:id')
  getTasksByUser(@Param('id') id: string) {
    return this.taskService.getTasksByUser(id);
  }

  @Post()
  createTask(@Body() dto: CreateTaskDto, @Req() req: Request) {
    return this.taskService.createTask(dto, req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task completion status and sync with Microsoft' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateTaskCompletionStatus(
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: Request,
  ) {
    return this.taskService.updateTaskCompletionStatus(taskId, dto, req);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string, @Req() req: Request) {
    return this.taskService.deleteTask(id, req);
  }
}
