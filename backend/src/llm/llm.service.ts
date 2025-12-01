import { Injectable } from '@nestjs/common';
import { TerminalService } from '../terminal/terminal.service';
import { PromptService } from './prompt.service';

@Injectable()
export class LlmService {
    constructor(
        private terminalService: TerminalService,
        private promptService: PromptService,
    ) { }

    async executePrompt(clientId: string, prompt: string, provider: string = 'echo') {
        // In a real scenario, 'provider' would determine the CLI tool (claude, gh, etc.)
        // For now, we'll simulate or use a generic echo for testing if no specific tool is set.

        let command = '';

        // Simple command construction
        // If provider is 'claude', we might run: claude "prompt"
        // If provider is 'echo', we run: echo "prompt"

        // Escaping quotes is important here.
        const safePrompt = prompt.replace(/"/g, '\\"');

        switch (provider) {
            case 'claude':
                command = `claude "${safePrompt}"`;
                break;
            case 'gh':
                command = `gh copilot suggest "${safePrompt}"`;
                break;
            default:
                command = `echo "AI Request: ${safePrompt}"`;
        }

        // Send command to terminal
        // We append \r\n to simulate Enter key
        this.terminalService.handleInput(clientId, command + '\r\n');

        return { status: 'sent', command };
    }
}
