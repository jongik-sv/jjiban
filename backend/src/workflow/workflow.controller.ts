import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

class CreateJobDto {
  issueId: string;
  isAutoMode?: boolean;
}

class ExecuteStepDto {
  stepIndex: number;
}

@ApiTags('Workflow')
@Controller('api/workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new workflow job' })
  @ApiBody({ type: CreateJobDto })
  async createJob(@Body() body: CreateJobDto) {
    return this.workflowService.createJob(body.issueId, body.isAutoMode);
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Get workflow job status' })
  async getStatus(@Param('jobId') jobId: string) {
    return this.workflowService.getJobStatus(jobId);
  }

  @Post(':jobId/execute')
  @ApiOperation({ summary: 'Execute a workflow step' })
  @ApiBody({ type: ExecuteStepDto })
  async executeStep(
    @Param('jobId') jobId: string,
    @Body() body: ExecuteStepDto,
  ) {
    return this.workflowService.executeStep(jobId, body.stepIndex);
  }

  @Post(':jobId/approve')
  @ApiOperation({ summary: 'Approve and continue to next step' })
  async approve(@Param('jobId') jobId: string) {
    return this.workflowService.progressWorkflow(jobId);
  }

  @Get('issue/:issueId')
  @ApiOperation({ summary: 'Get workflows for an issue' })
  async getByIssue(@Param('issueId') issueId: string) {
    return this.workflowService.getJobsByIssue(issueId);
  }
}
