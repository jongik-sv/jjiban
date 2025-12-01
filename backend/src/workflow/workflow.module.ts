import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { WorkflowGateway } from './workflow.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { LlmModule } from '../llm/llm.module';
import { TerminalModule } from '../terminal/terminal.module';

@Module({
  imports: [PrismaModule, LlmModule, TerminalModule],
  providers: [WorkflowService, WorkflowGateway],
  controllers: [WorkflowController],
  exports: [WorkflowService],
})
export class WorkflowModule { }
