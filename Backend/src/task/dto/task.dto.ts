import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    example: '23jad2424bhabd232',
    required: true,
    description: 'Case ID for which task is created',
  })
  @IsString()
  case_id: string;

  @ApiProperty({
    example: '23jad2424bhabd232',
    required: true,
    description: 'User ID for which task is created',
  })
  @IsString()
  staff_id: string;

  @ApiProperty({
    example: 'Employment Action Plan (EAP)',
    required: true,
    description: 'Description of the task',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '2024-10-21',
    required: true,
    description: 'Due date for the task assigned',
  })
  @IsDateString()
  due_date: Date;
}

export class UpdateTaskDto {
  @ApiProperty({ required: true, description: 'Completion status' })
  @IsBoolean()
  @IsOptional()
  is_complete?: boolean;

  @ApiProperty({
    example: 'Updated task description',
    required: false,
    description: 'Updated description of the task',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2024-10-25',
    required: false,
    description: 'Updated due date for the task',
  })
  @IsOptional()
  @IsDateString()
  due_date?: Date;
}
