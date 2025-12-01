import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { PromptTemplateService } from './prompt-template.service';
import { CreatePromptTemplateDto } from './dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from './dto/update-prompt-template.dto';

@Controller('projects/:projectId/templates')
export class PromptTemplateController {
    constructor(private readonly promptTemplateService: PromptTemplateService) { }

    @Post()
    create(
        @Param('projectId') projectId: string,
        @Body() createDto: CreatePromptTemplateDto,
    ) {
        return this.promptTemplateService.create(projectId, createDto);
    }

    @Get()
    findAll(@Param('projectId') projectId: string) {
        return this.promptTemplateService.findAll(projectId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.promptTemplateService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateDto: UpdatePromptTemplateDto,
    ) {
        return this.promptTemplateService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.promptTemplateService.remove(id);
    }
}
