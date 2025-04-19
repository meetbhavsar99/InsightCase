import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import { CaseModule } from './case/case.module';
import { ClientModule } from './client/client.module';
import { ServiceModule } from './service/service.module';
import { TaskController } from './task/task.controller';
import { TaskService } from './task/task.service';
import { TaskModule } from './task/task.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import * as Joi from 'joi';
import { JwtAuthGuard } from './shared/guards/jwt.guard';
import { AuthService } from './auth/auth.service';
import { GraphService } from './graph/graph.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Environment
        NODE_ENV: Joi.string().valid('development', 'production').default('production'),
        PORT: Joi.number().default(3000),

        // Azure Authentication
        AZURE_TENANT_ID: Joi.string().required(),
        AZURE_CLIENT_ID: Joi.string().required(),
        AZURE_CLIENT_SECRET: Joi.string().required(),
        AZURE_REDIRECT_URI: Joi.string().required(),

        // Session Management
        SESSION_SECRET_KEY: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
      },
    }),
    AuthModule,
    PrismaModule,
    CaseModule,
    ClientModule,
    ServiceModule,
    TaskModule,
    UserModule,
  ],
  controllers: [AppController, TaskController],
  providers: [AppService, JwtService, PrismaService, TaskService, JwtAuthGuard, AuthService, GraphService],
})
export class AppModule {}
