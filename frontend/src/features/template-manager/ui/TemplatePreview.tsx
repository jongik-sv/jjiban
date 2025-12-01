import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Handlebars from 'handlebars';
import { type PromptTemplate } from '../api/templateApi';
import { ArrowLeft, Send } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Issue {
    id: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    priority: string;
}

interface TemplatePreviewProps {
    template: PromptTemplate;
    projectId: string;
    onBack: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, projectId, onBack }) => {
    const [selectedIssueId, setSelectedIssueId] = useState<string>('');

    // 프로젝트의 이슈 목록 가져오기
    const { data: issues, isLoading: issuesLoading } = useQuery<Issue[]>({
        queryKey: ['issues', projectId],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/projects/${projectId}/issues`);
            return response.data;
        },
    });

    // 선택된 이슈 찾기
    const selectedIssue = useMemo(() => {
        if (!selectedIssueId || !issues) return null;
        return issues.find(issue => issue.id === selectedIssueId) || null;
    }, [selectedIssueId, issues]);

    // 템플릿 렌더링
    const renderedPrompt = useMemo(() => {
        if (!selectedIssue || !template) return '';

        try {
            const compiledTemplate = Handlebars.compile(template.prompt);
            const context = {
                task: selectedIssue,
                issue: selectedIssue,
                // 추가 변수들
                ...template.variables,
            };
            return compiledTemplate(context);
        } catch (error) {
            return `Error rendering template: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }, [selectedIssue, template]);

    // 터미널로 전송
    const handleSendToTerminal = () => {
        if (!renderedPrompt) return;

        // WebSocket을 통해 터미널로 전송 (기존 터미널 서비스 활용)
        // 여기서는 단순히 클립보드에 복사하는 것으로 대체
        navigator.clipboard.writeText(renderedPrompt).then(() => {
            alert('Prompt copied to clipboard! You can paste it in the terminal.');
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-md"
                        title="Back to list"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold">{template.name}</h2>
                        <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {template.llmType}
                    </span>
                </div>
            </div>

            {/* Issue Selector */}
            <div className="bg-white rounded-lg shadow p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Sample Task/Issue
                </label>
                {issuesLoading ? (
                    <div className="text-sm text-gray-500">Loading issues...</div>
                ) : (
                    <select
                        value={selectedIssueId}
                        onChange={(e) => setSelectedIssueId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">-- Select an issue --</option>
                        {issues?.map((issue) => (
                            <option key={issue.id} value={issue.id}>
                                [{issue.type}] {issue.title}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Template Source */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Template Source</h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-48 text-xs font-mono">
                    {template.prompt}
                </pre>
            </div>

            {/* Preview Output */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Rendered Output</h3>
                    <button
                        onClick={handleSendToTerminal}
                        disabled={!renderedPrompt || !selectedIssue}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                        Copy to Clipboard
                    </button>
                </div>
                {!selectedIssue ? (
                    <div className="bg-gray-50 p-8 rounded-md text-center text-gray-500 text-sm">
                        Select an issue above to preview the template
                    </div>
                ) : (
                    <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-sm font-mono whitespace-pre-wrap">
                        {renderedPrompt}
                    </pre>
                )}
            </div>

            {/* Variable Information */}
            {selectedIssue && (
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Available Variables</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 p-2 rounded">
                            <span className="font-mono text-indigo-600">{'{{task.title}}'}</span>
                            <div className="text-gray-600 mt-1">{selectedIssue.title}</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <span className="font-mono text-indigo-600">{'{{task.type}}'}</span>
                            <div className="text-gray-600 mt-1">{selectedIssue.type}</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <span className="font-mono text-indigo-600">{'{{task.status}}'}</span>
                            <div className="text-gray-600 mt-1">{selectedIssue.status}</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <span className="font-mono text-indigo-600">{'{{task.priority}}'}</span>
                            <div className="text-gray-600 mt-1">{selectedIssue.priority}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
