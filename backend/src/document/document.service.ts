import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateDocumentFilename } from './utils/filename.util';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  modified?: Date;
  size?: number;
}

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) { }

  /**
   * Get all documents for an issue
   */
  async getIssueDocuments(issueId: string): Promise<FileNode> {
    // Get issue doc_path from database
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      select: { docPath: true, title: true },
    });

    if (!issue) {
      throw new NotFoundException(`Issue ${issueId} not found`);
    }

    // If no docPath, return empty tree
    if (!issue.docPath) {
      return {
        name: 'root',
        path: '',
        type: 'folder',
        children: [],
      };
    }

    // Build file tree from the docPath directory
    try {
      const fileTree = await this.buildFileTree(issue.docPath);
      return fileTree;
    } catch (error) {
      console.error('Error building file tree:', error);
      // Return empty tree if directory doesn't exist
      return {
        name: 'root',
        path: issue.docPath,
        type: 'folder',
        children: [],
      };
    }
  }

  /**
   * Get document content by path
   */
  async getDocumentContent(filePath: string) {
    // Security: Validate path to prevent directory traversal
    if (filePath.includes('..') || !filePath) {
      throw new BadRequestException('Invalid file path');
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);

      return {
        path: filePath,
        content,
        metadata: {
          modified: stats.mtime,
          size: stats.size,
          encoding: 'utf-8',
        },
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Create or update a document
   */
  async createDocument(filePath: string, content: string) {
    // Security: Validate path
    if (filePath.includes('..') || !filePath) {
      throw new BadRequestException('Invalid file path');
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(filePath, content, 'utf-8');

      const stats = await fs.stat(filePath);

      return {
        path: filePath,
        content,
        metadata: {
          modified: stats.mtime,
          size: stats.size,
          encoding: 'utf-8',
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to create document');
    }
  }

  /**
   * Create a dedicated folder for a task
   */
  async createTaskFolder(issue: { id: string; title: string }): Promise<string> {
    // Define base path for task docs
    // In a real app, this might be configured in env
    const projectRoot = process.cwd();
    const docsRoot = path.join(projectRoot, 'docs', 'tasks');

    // Create folder name: {shortId}-{sanitizedTitle}
    const shortId = issue.id.substring(0, 8);
    const sanitizedTitle = issue.title
      .replace(/[^a-zA-Z0-9가-힣\s-_]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 30);

    const folderName = `${shortId}-${sanitizedTitle}`;
    const folderPath = path.join(docsRoot, folderName);

    try {
      await fs.mkdir(folderPath, { recursive: true });
      return folderPath;
    } catch (error) {
      console.error(`Failed to create task folder at ${folderPath}:`, error);
      throw new BadRequestException('Failed to create task folder');
    }
  }

  /**
   * Create a document with automatic naming
   */
  async createDocumentWithAutoName(
    issueId: string,
    type: string,
    llm: string,
    content: string
  ) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    if (!issue.docPath) {
      // If no folder exists, try to create one (self-healing)
      const newPath = await this.createTaskFolder(issue);
      await this.prisma.issue.update({
        where: { id: issueId },
        data: { docPath: newPath },
      });
      issue.docPath = newPath;
    }

    // Find next sequence number
    let sequence = 1;
    let filename = '';
    let filePath = '';

    // Simple loop to find next available sequence
    while (true) {
      filename = generateDocumentFilename(issue, type, llm, sequence);
      filePath = path.join(issue.docPath, filename);

      try {
        await fs.access(filePath);
        // File exists, try next sequence
        sequence++;
      } catch (e) {
        // File does not exist, use this one
        break;
      }
    }

    return this.createDocument(filePath, content);
  }

  /**
   * Build file tree from directory
   */
  private async buildFileTree(dirPath: string): Promise<FileNode> {
    const stats = await fs.stat(dirPath);
    const name = path.basename(dirPath);

    if (stats.isFile()) {
      return {
        name,
        path: dirPath,
        type: 'file',
        modified: stats.mtime,
        size: stats.size,
      };
    }

    // Directory
    const entries = await fs.readdir(dirPath);
    const children: FileNode[] = [];

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      try {
        const childNode = await this.buildFileTree(entryPath);
        children.push(childNode);
      } catch (error) {
        // Skip files that can't be read
        console.warn(`Skipping ${entryPath}:`, error.message);
      }
    }

    // Sort: folders first, then files alphabetically
    children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      name: name || 'root',
      path: dirPath,
      type: 'folder',
      children,
      modified: stats.mtime,
      size: stats.size,
    };
  }
}
