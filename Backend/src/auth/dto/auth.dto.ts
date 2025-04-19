import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'test@test.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'test123',
    required: true,
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'test',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    examples: [Role.ADMIN, Role.CASE_MANAGER, Role.MANAGER],
    required: true,
  })
  @IsEnum(Role)
  role: Role;
}

export class SignInDto {
  @ApiProperty({
    example: 'test@test.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'test123',
    required: true,
  })
  @IsString()
  password: string;
}
