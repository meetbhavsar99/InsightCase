import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

interface RequestWithUser extends Request {
  params: any;
  user: User;
  method: any;
}

@Injectable()
export class CaseAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const caseId = request.params?.id;
    const user = request?.user;

    const caseAccess = await this.prisma.case_access.findFirst({
      where: {
        case_id: caseId,
        user_id: user.id,
      },
    });

    if (!caseAccess) {
      throw new ForbiddenException('You do not have access to this case');
    }

    const method = request?.method;
    if (method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
      if (caseAccess.access_level !== 'MANAGE') {
        throw new ForbiddenException('You do not have permission to manage this case');
      }
    }

    return true;
  }
}
