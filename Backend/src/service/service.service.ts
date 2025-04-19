import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { prismaError } from 'src/shared/filters/error-handling';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllServices() {
    try {
      return await this.prisma.service.findMany({
        include: {
          _count: { select: { cases: true } },
        },
      });
    } catch (err) {
      prismaError(err);
    }
  }

  async getService(id: string) {
    try {
      return await this.prisma.service.findFirst({
        where: {
          id,
        },
      });
    } catch (err) {
      prismaError(err);
    }
  }

  async createService(dto: CreateServiceDto) {
    try {
      const existingService = await this.prisma.service.findFirst({
        where: {
          name: dto.name,
        },
      });

      if (existingService) {
        throw new ConflictException('Another service with the same name already exist!');
      }

      return await this.prisma.service.create({ data: { ...dto } });
    } catch (err) {
      prismaError(err);
    }
  }

  async updateService(id: string, dto: UpdateServiceDto) {
    try {
      const existingService = await this.prisma.service.findFirst({
        where: {
          name: dto.name,
          NOT: { id },
        },
      });

      if (existingService) {
        throw new ConflictException('Another service with the same name already exist!');
      }

      return await this.prisma.service.update({ where: { id }, data: { ...dto } });
    } catch (err) {
      prismaError(err);
    }
  }

  async deleteService(id: string) {
    try {
      return await this.prisma.service.delete({ where: { id } });
    } catch (err) {
      prismaError(err);
    }
  }
}
