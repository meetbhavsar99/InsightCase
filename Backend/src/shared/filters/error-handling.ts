import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export const prismaError = (err: any) => {
  if (err.code == 'P2025') {
    throw new NotFoundException(err.meta.cause);
  }

  if (err.code == 'P2002') {
    throw new ForbiddenException(
      `Same record already exist. Unique constraint required for ${err.meta.target}`,
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    throw new ForbiddenException('One of the records does not exist. Please fill correct details');
  }

  throw err;
};
