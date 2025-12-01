import { Module } from '@nestjs/common';
import { PromptTemplateService } from './prompt-template.service';
import { PromptTemplateController } from './prompt-template.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PromptTemplateController],
    providers: [PromptTemplateService],
    exports: [PromptTemplateService],
})
export class PromptTemplateModule { }
