import { useState } from 'react';
import axios from 'axios';

interface AskAIButtonProps {
    terminalClientId?: string;
}

export const AskAIButton = ({ terminalClientId }: AskAIButtonProps) => {
    const [prompt, setPrompt] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [provider, setProvider] = useState('echo');

    const handleSubmit = async () => {
        if (!prompt.trim() || !terminalClientId) return;

        try {
            await axios.post('http://localhost:3000/api/llm/execute', {
                clientId: terminalClientId,
                prompt,
                provider,
            });
            setPrompt('');
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to execute prompt:', error);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded hover:bg-primary/90"
            >
                Ask AI
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg w-96 border border-border">
                <h3 className="text-lg font-semibold mb-4">Ask AI</h3>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Provider</label>
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                    >
                        <option value="echo">Echo (Test)</option>
                        <option value="claude">Claude CLI</option>
                        <option value="gh">GitHub Copilot</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt..."
                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm h-32 resize-none"
                    />
                </div>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-sm border border-border rounded hover:bg-secondary/20"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!prompt.trim()}
                        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                        Execute
                    </button>
                </div>
            </div>
        </div>
    );
};
