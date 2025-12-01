import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DocumentService } from './document.service';

@Controller('documents')
@ApiTags('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Get('issues/:issueId/documents')
  @ApiOperation({ summary: 'Get all documents for an issue' })
  @ApiResponse({ status: 200, description: 'File tree returned successfully' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  async getIssueDocuments(@Param('issueId') issueId: string) {
    return this.documentService.getIssueDocuments(issueId);
  }

  @Get('content')
  @ApiOperation({ summary: 'Get document content by path' })
  @ApiQuery({ name: 'path', description: 'File path', required: true })
  @ApiResponse({ status: 200, description: 'Document content returned' })
  @ApiResponse({ status: 400, description: 'Invalid file path' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getDocumentContent(@Query('path') path: string) {
    return this.documentService.getDocumentContent(path);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update a document' })
  @ApiResponse({ status: 201, description: 'Document created/updated' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async createDocument(
    @Body() body: { path: string; content: string },
  ) {
    return this.documentService.createDocument(body.path, body.content);
  }

  @Post('issue/:issueId')
  @ApiOperation({ summary: 'Create a document with auto-generated name' })
  @ApiResponse({ status: 201, description: 'Document created' })
  async createIssueDocument(
    @Param('issueId') issueId: string,
    @Body() body: { type: string; llm: string; content: string },
  ) {
    return this.documentService.createDocumentWithAutoName(
      issueId,
      body.type,
      body.llm,
      body.content,
    );
  }
}
