import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi, type PromptTemplate } from '../api/templateApi';
import { Plus, Edit, Trash2, Check, X, Search } from 'lucide-react';

interface TemplateListProps {
    projectId: string;
    onEdit: (template: PromptTemplate) => void;
    onCreate: () => void;
    onPreview?: (template: PromptTemplate) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({ projectId, onEdit, onCreate, onPreview }) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [llmTypeFilter, setLlmTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const { data: templates, isLoading } = useQuery({
        queryKey: ['templates', projectId],
        queryFn: () => templateApi.getAll(projectId),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => templateApi.delete(projectId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates', projectId] });
        },
    });

    // 필터링된 템플릿 목록
    const filteredTemplates = useMemo(() => {
        if (!templates) return [];

        return templates.filter(template => {
            // 검색어 필터
            if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            // LLM 타입 필터
            if (llmTypeFilter !== 'all' && template.llmType !== llmTypeFilter) {
                return false;
            }
            // 활성화 상태 필터
            if (statusFilter === 'active' && !template.isActive) return false;
            if (statusFilter === 'inactive' && template.isActive) return false;

            return true;
        });
    }, [templates, searchTerm, llmTypeFilter, statusFilter]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this template?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    if (isLoading) return <div>Loading templates...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Prompt Templates</h2>
                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    <Plus size={16} />
                    New Template
                </button>
            </div>

            {/* 검색 및 필터 UI */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 검색 */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* LLM 타입 필터 */}
                    <div>
                        <select
                            value={llmTypeFilter}
                            onChange={(e) => setLlmTypeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All LLM Types</option>
                            <option value="claude">Claude</option>
                            <option value="gpt4">GPT-4</option>
                            <option value="gemini">Gemini</option>
                        </select>
                    </div>

                    {/* 상태 필터 */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'active'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setStatusFilter('inactive')}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'inactive'
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Inactive
                        </button>
                    </div>
                </div>

                {/* 결과 카운트 */}
                <div className="mt-3 text-sm text-gray-600">
                    Showing {filteredTemplates.length} of {templates?.length || 0} templates
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LLM Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTemplates.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No templates found
                                </td>
                            </tr>
                        ) : (
                            filteredTemplates.map((template) => (
                                <tr key={template.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                                        <div className="text-sm text-gray-500">{template.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                            {template.llmType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {template.isActive ? (
                                            <span className="flex items-center text-green-600 text-sm">
                                                <Check size={16} className="mr-1" /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-gray-400 text-sm">
                                                <X size={16} className="mr-1" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {onPreview && (
                                            <button
                                                onClick={() => onPreview(template)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                title="Preview"
                                            >
                                                👁️
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onEdit(template)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
