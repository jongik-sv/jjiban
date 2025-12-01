import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { PromptService } from './prompt.service';
import { TerminalModule } from '../terminal/terminal.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [TerminalModule, PrismaModule],
  providers: [LlmService, PromptService],
  controllers: [LlmController],
  exports: [LlmService],
})
export class LlmModule { }
