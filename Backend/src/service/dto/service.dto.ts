import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    example: 'WSIB',
    required: true,
    description: 'The name of the service',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '1',
    required: true,
    description: 'Number of days for the initial contact',
  })
  @IsNumber()
  initial_contact_days: number;

  @ApiProperty({
    example: '5',
    required: true,
    description: 'Number of days for the intake interview',
  })
  @IsNumber()
  intake_interview_days: number;

  @ApiProperty({
    example: '2',
    required: true,
    description: 'Number of weeks for the Employment Action Plan',
  })
  @IsNumber()
  action_plan_weeks: number;

  @ApiProperty({ required: true, description: 'True if monthly contact is required' })
  @IsBoolean()
  monthly_contact: boolean;

  @ApiProperty({ required: true, description: 'True if monthly reports are required' })
  @IsBoolean()
  monthly_reports: boolean;
}

export class UpdateServiceDto {
  @ApiProperty({
    example: 'WSIB',
    description: 'The name of the service',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    example: '1',
    description: 'Number of days for the initial contact',
  })
  @IsOptional()
  @IsNumber()
  initial_contact_days: number;

  @ApiProperty({
    example: '5',
    description: 'Number of days for the intake interview',
  })
  @IsOptional()
  @IsNumber()
  intake_interview_days: number;

  @ApiProperty({
    example: '2',
    description: 'Number of weeks for the Employment Action Plan',
  })
  @IsOptional()
  @IsNumber()
  action_plan_weeks: number;

  @ApiProperty({ description: 'True if monthly contact is required' })
  @IsBoolean()
  monthly_contact: boolean;

  @ApiProperty({ description: 'True if monthly reports are required' })
  @IsOptional()
  @IsBoolean()
  monthly_reports: boolean;
}
