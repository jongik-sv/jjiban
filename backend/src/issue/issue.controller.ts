import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Issue')
@Controller('issue')
export class IssueController {
  constructor(private readonly issueService: IssueService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new issue' })
  create(@Body() createIssueDto: CreateIssueDto) {
    return this.issueService.create(createIssueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all issues' })
  findAll() {
    return this.issueService.findAll();
  }

  @Get(':id/context-menu')
  @ApiOperation({ summary: 'Get context menu for issue' })
  getContextMenu(@Param('id') id: string) {
    return this.issueService.getContextMenu(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issueService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIssueDto: UpdateIssueDto) {
    return this.issueService.update(+id, updateIssueDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update issue status (Drag & Drop)' })
  updateStatus(@Param('id') id: string, @Body() updateIssueStatusDto: UpdateIssueStatusDto) {
    return this.issueService.updateStatus(id, updateIssueStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.issueService.remove(+id);
  }
}

