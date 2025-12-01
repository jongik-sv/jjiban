import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromptTemplateDto } from './dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from './dto/update-prompt-template.dto';

@Injectable()
export class PromptTemplateService {
    constructor(private prisma: PrismaService) { }

    async create(projectId: string, createDto: CreatePromptTemplateDto) {
        return this.prisma.promptTemplate.create({
            data: {
                ...createDto,
                projectId,
            },
        });
    }

    async findAll(projectId: string) {
        return this.prisma.promptTemplate.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const template = await this.prisma.promptTemplate.findUnique({
            where: { id },
        });
        if (!template) {
            throw new NotFoundException(`Prompt template with ID ${id} not found`);
        }
        return template;
    }

    async update(id: string, updateDto: UpdatePromptTemplateDto) {
        await this.findOne(id); // Ensure existence
        return this.prisma.promptTemplate.update({
            where: { id },
            data: updateDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Ensure existence
        return this.prisma.promptTemplate.delete({
            where: { id },
        });
    }
}
