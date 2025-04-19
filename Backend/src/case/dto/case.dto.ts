import { ApiProperty } from '@nestjs/swagger';
import { Region, Status } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateCaseDto {
  @ApiProperty({
    example: 'asda343dasd32',
    required: true,
  })
  @IsString()
  client_id: string;

  @ApiProperty({
    example: 'asdasg8492najsd',
    required: true,
  })
  @IsString()
  case_manager_id: string;

  @ApiProperty({
    example: 'sjdknfnv3224df',
    required: true,
  })
  @IsString()
  service_id: string;

  @ApiProperty({
    example: 'WINDSOR',
    required: true,
  })
  @IsEnum(Region)
  region: Region;

  @ApiProperty({
    example: 'OPEN',
    required: false,
  })
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    example: '21-10-2024',
    required: false,
  })
  @IsDateString()
  start_at?: string;

  @ApiProperty({
    example: 'asdsad343fa434',
    required: true,
    description: 'Tasks are assigned to which staff member',
  })
  @IsString()
  staff_id: string;
}

export class UpdateTaskDto {
  @ApiProperty({
    example: 'task-id-123',
    required: true,
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: true,
    required: true,
  })
  @IsBoolean()
  is_complete: boolean;
}

export class UpdateCaseDto {
  @ApiProperty({
    example: 'OPEN',
    required: false,
  })
  @IsOptional()
  @IsEnum(['OPEN', 'ONGOING', 'CLOSED'])
  status?: Status;

  @ApiProperty({
    type: [UpdateTaskDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTaskDto)
  tasks?: UpdateTaskDto[];
}
