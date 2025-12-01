import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { PrismaService } from '../prisma/prisma.service';
import { KanbanGateway } from '../gateways/kanban.gateway';
import { WorkflowService } from '../workflow/workflow.service';
import { DocumentService } from '../document/document.service';

@Injectable()
export class IssueService {
  constructor(
    private prisma: PrismaService,
    private kanbanGateway: KanbanGateway,
    private workflowService: WorkflowService,
    private documentService: DocumentService,
  ) { }

  async create(createIssueDto: CreateIssueDto) {
    // Create issue first
    const issue = await this.prisma.issue.create({
      data: createIssueDto,
    });

    // Create document folder
    try {
      const docPath = await this.documentService.createTaskFolder(issue);

      // Update issue with docPath
      return this.prisma.issue.update({
        where: { id: issue.id },
        data: { docPath },
      });
    } catch (error) {
      console.error('Failed to create task folder:', error);
      // Return issue even if folder creation fails (graceful degradation)
      return issue;
    }
  }

  findAll() {
    return this.prisma.issue.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} issue`;
  }

  update(id: number, updateIssueDto: UpdateIssueDto) {
    return `This action updates a #${id} issue`;
  }

  async updateStatus(id: string, updateIssueStatusDto: UpdateIssueStatusDto) {
    const previousIssue = await this.prisma.issue.findUnique({ where: { id } });

    const issue = await this.prisma.issue.update({
      where: { id },
      data: {
        status: updateIssueStatusDto.status,
        // order: updateIssueStatusDto.order, // TODO: Implement ordering logic
      },
    });

    // Broadcast the change
    this.kanbanGateway.broadcastIssueMoved(issue.projectId, issue);

    // Trigger workflow if status changed to "In Progress"
    if (previousIssue && previousIssue.status !== 'In Progress' && issue.status === 'In Progress') {
      try {
        // Create workflow in manual mode by default
        await this.workflowService.createJob(issue.id, false);
      } catch (error) {
        console.error('Failed to create workflow:', error);
      }
    }

    return issue;
  }

  async getContextMenu(id: string) {
    // Get issue to check status and type
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      select: { status: true, type: true, projectId: true },
    });

    if (!issue) {
      throw new NotFoundException(`Issue ${id} not found`);
    }

    // Get all active templates for the project
    const templates = await this.prisma.promptTemplate.findMany({
      where: {
        projectId: issue.projectId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        llmType: true,
        prompt: true,
        visibleColumns: true,
        visibleTypes: true,
      },
    });

    // Filter templates based on visible_columns (status) and visible_types
    const filteredTemplates = templates.filter((template) => {
      const statusMatch = template.visibleColumns.includes(issue.status);
      const typeMatch = template.visibleTypes.includes(issue.type);
      return statusMatch && typeMatch;
    });

    return {
      templates: filteredTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        llmType: t.llmType,
        prompt: t.prompt,
      })),
    };
  }

  remove(id: number) {
    return `This action removes a #${id} issue`;
  }
}

