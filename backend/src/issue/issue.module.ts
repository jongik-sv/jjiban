import { Module } from '@nestjs/common';
import { IssueService } from './issue.service';
import { IssueController } from './issue.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { KanbanGateway } from '../gateways/kanban.gateway';
import { WorkflowModule } from '../workflow/workflow.module';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [PrismaModule, WorkflowModule, DocumentModule],
  controllers: [IssueController],
  providers: [IssueService, KanbanGateway],
})
export class IssueModule { }
