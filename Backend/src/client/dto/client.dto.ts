import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsNumberString,
} from 'class-validator';
import { Region } from '@prisma/client';

export class CreateClientDto {
  @ApiProperty({
    example: 'John',
    required: true,
    description: 'The first name of the client',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    required: true,
    description: 'The last name of the client',
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    example: '1995-12-15',
    required: true,
    description: 'The date of birth of the client',
  })
  @IsDateString()
  dob: Date;

  @ApiProperty({
    example: 'johndoe@example.com',
    required: true,
    description: 'The email address of the client',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '2345678901',
    required: true,
    description: 'The phone number of the client',
  })
  @IsNumberString()
  phone: string;

  @ApiProperty({
    example: '123 Main St, Windsor, ON',
    required: true,
    description: 'The physical address of the client',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'WINDSOR',
    required: true,
    description: 'The office Location assigned to the client',
  })
  @IsEnum(Region)
  region: Region;

  @ApiProperty({
    example: 12345,
    required: true,
    description: 'The reference number for the client',
  })
  @IsInt()
  reference_number: number;

  @ApiProperty({
    example: '2024-09-15',
    required: true,
    description: 'The date the client was referred to the service',
  })
  @IsDateString()
  referral_date: Date;
}

export class UpdateClientDto {
  @ApiProperty({
    example: 'John',
    required: false,
    description: 'The first name of the client',
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    example: 'Doe',
    required: false,
    description: 'The last name of the client',
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({
    example: '1990-12-15',
    required: false,
    description: 'The date of birth of the client',
  })
  @IsOptional()
  @IsDateString()
  dob?: Date;

  @ApiProperty({
    example: 'johndoe@example.com',
    required: false,
    description: 'The email address of the client',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+1-234-567-8901',
    required: false,
    description: 'The phone number of the client',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '123 Main St, Windsor, ON',
    required: false,
    description: 'The physical address of the client',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'WINDSOR',
    required: false,
    description: 'The office location assigned to the client',
  })
  @IsOptional()
  @IsEnum(Region)
  region?: Region;

  @ApiProperty({
    example: 12345,
    required: false,
    description: 'The reference number for the client',
  })
  @IsOptional()
  @IsInt()
  reference_number?: number;

  @ApiProperty({
    example: '2024-09-15',
    required: false,
    description: 'The date the client was referred to the service',
  })
  @IsOptional()
  @IsDateString()
  referral_date?: Date;
}
