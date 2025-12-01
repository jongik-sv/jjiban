import { Controller, Post, Body } from '@nestjs/common';
import { LlmService } from './llm.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

class ExecutePromptDto {
    clientId: string;
    prompt: string;
    provider?: string;
}

@ApiTags('LLM')
@Controller('api/llm')
export class LlmController {
    constructor(private readonly llmService: LlmService) { }

    @Post('execute')
    @ApiOperation({ summary: 'Execute an LLM prompt in the terminal' })
    @ApiBody({ type: ExecutePromptDto })
    async execute(@Body() body: ExecutePromptDto) {
        return this.llmService.executePrompt(body.clientId, body.prompt, body.provider);
    }
}
