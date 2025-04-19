import { Module } from '@nestjs/common';
import { CaseService } from './case.service';
import { CaseController } from './case.controller';
import { GraphService } from 'src/graph/graph.service';

@Module({
  providers: [CaseService, GraphService],
  controllers: [CaseController],
})
export class CaseModule {}
