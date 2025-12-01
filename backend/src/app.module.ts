import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { IssueModule } from './issue/issue.module';
import { TerminalModule } from './terminal/terminal.module';
import { LlmModule } from './llm/llm.module';
import { WorkflowModule } from './workflow/workflow.module';
import { DocumentModule } from './document/document.module';
import { PromptTemplateModule } from './prompt-template/prompt-template.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProjectModule,
    IssueModule,
    TerminalModule,
    LlmModule,
    WorkflowModule,
    DocumentModule,
    PromptTemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
