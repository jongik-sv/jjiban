import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromptService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.promptTemplate.findMany();
    }

    async create(data: {
        name: string;
        prompt: string;
        llmType: string;
        description?: string;
    }) {
        return this.prisma.promptTemplate.create({ data });
    }

    renderTemplate(template: string, variables: Record<string, string>): string {
        return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
    }
}
