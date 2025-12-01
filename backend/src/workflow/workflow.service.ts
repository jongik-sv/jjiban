import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { WorkflowGateway } from './workflow.gateway';

const DEFAULT_WORKFLOW_STEPS = [
  { name: 'Design', description: 'Create technical design document' },
  { name: 'Implementation', description: 'Write code based on design' },
  { name: 'Testing', description: 'Write and run tests' },
];

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
    private workflowGateway: WorkflowGateway,
  ) { }

  async createJob(issueId: string, isAutoMode: boolean = false) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) throw new Error('Issue not found');

    // Create workflow job
    const job = await this.prisma.workflowJob.create({
      data: {
        issueId,
        status: 'running',
        isAutoMode,
        currentStepIndex: 0,
      },
    });

    // Create workflow steps
    for (const step of DEFAULT_WORKFLOW_STEPS) {
      await this.prisma.workflowStep.create({
        data: {
          jobId: job.id,
          stepName: step.name,
          status: 'pending',
        },
      });
    }

    // Broadcast creation
    this.workflowGateway.broadcastWorkflowUpdate(job.id);

    // If auto mode, start first step
    if (isAutoMode) {
      await this.executeStep(job.id, 0);
    }

    return job;
  }

  async executeStep(jobId: string, stepIndex: number) {
    const job = await this.prisma.workflowJob.findUnique({
      where: { id: jobId },
      include: { steps: true, issue: true },
    });

    if (!job) throw new Error('Job not found');
    if (stepIndex >= job.steps.length) throw new Error('Step index out of range');

    const step = job.steps[stepIndex];

    // Update step status to running
    await this.prisma.workflowStep.update({
      where: { id: step.id },
      data: { status: 'running', startedAt: new Date() },
    });

    try {
      // Execute LLM command for this step
      // For now, using echo as placeholder
      const prompt = `Execute step "${step.stepName}" for issue: ${job.issue.title}`;

      // We need a terminal client ID to execute the command
      // In a real scenario, this would come from an active terminal session
      // For now, we'll just log the result

      const result = {
        status: 'success',
        summary: `Completed ${step.stepName} step`,
      };

      // Update step as completed
      await this.prisma.workflowStep.update({
        where: { id: step.id },
        data: {
          status: 'success',
          completedAt: new Date(),
          resultSummary: result.summary,
        },
      });

      // Broadcast update
      this.workflowGateway.broadcastWorkflowUpdate(jobId);

      // If auto mode and not last step, proceed to next
      if (job.isAutoMode && stepIndex < job.steps.length - 1) {
        await this.progressWorkflow(jobId);
      } else if (stepIndex === job.steps.length - 1) {
        // Last step completed, mark job as completed
        await this.prisma.workflowJob.update({
          where: { id: jobId },
          data: { status: 'completed' },
        });
        this.workflowGateway.broadcastWorkflowUpdate(jobId);
      } else {
        // Manual mode, request approval
        this.workflowGateway.requestApproval(jobId, stepIndex + 1);
      }

      return result;
    } catch (error) {
      // Mark step as failed
      await this.prisma.workflowStep.update({
        where: { id: step.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          resultSummary: error.message,
        },
      });

      await this.prisma.workflowJob.update({
        where: { id: jobId },
        data: { status: 'failed' },
      });

      this.workflowGateway.broadcastWorkflowUpdate(jobId);
      throw error;
    }
  }

  async progressWorkflow(jobId: string) {
    const job = await this.prisma.workflowJob.findUnique({
      where: { id: jobId },
      include: { steps: true },
    });

    if (!job) throw new Error('Job not found');

    const nextStepIndex = job.currentStepIndex + 1;

    if (nextStepIndex >= job.steps.length) {
      throw new Error('No more steps to execute');
    }

    await this.prisma.workflowJob.update({
      where: { id: jobId },
      data: { currentStepIndex: nextStepIndex },
    });

    await this.executeStep(jobId, nextStepIndex);
  }

  async getJobStatus(jobId: string) {
    return this.prisma.workflowJob.findUnique({
      where: { id: jobId },
      include: { steps: true, issue: true },
    });
  }

  async getJobsByIssue(issueId: string) {
    return this.prisma.workflowJob.findMany({
      where: { issueId },
      include: { steps: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
