import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { type PromptTemplate, type CreatePromptTemplateDto } from '../api/templateApi';

interface TemplateEditorProps {
    initialData?: PromptTemplate;
    onSave: (data: CreatePromptTemplateDto) => Promise<void>;
    onCancel: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<CreatePromptTemplateDto>({
        name: '',
        description: '',
        prompt: '',
        llmType: 'claude',
        visibleColumns: [],
        visibleTypes: [],
        variables: {},
        isActive: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                prompt: initialData.prompt,
                llmType: initialData.llmType,
                visibleColumns: initialData.visibleColumns,
                visibleTypes: initialData.visibleTypes,
                variables: initialData.variables,
                isActive: initialData.isActive,
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">LLM Type</label>
                    <select
                        value={formData.llmType}
                        onChange={(e) => setFormData({ ...formData, llmType: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    >
                        <option value="claude">Claude</option>
                        <option value="gpt4">GPT-4</option>
                        <option value="gemini">Gemini</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                    type="text"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
            </div>

            {/* Visible Columns */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visible Columns</label>
                <p className="text-xs text-gray-500 mb-2">Select columns where this template should appear in context menu</p>
                <div className="grid grid-cols-2 gap-2">
                    {['todo', 'in-progress', 'review', 'done'].map((column) => (
                        <label key={column} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.visibleColumns?.includes(column) || false}
                                onChange={(e) => {
                                    const newColumns = e.target.checked
                                        ? [...(formData.visibleColumns || []), column]
                                        : (formData.visibleColumns || []).filter(c => c !== column);
                                    setFormData({ ...formData, visibleColumns: newColumns });
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm capitalize">{column}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Visible Types */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visible Issue Types</label>
                <p className="text-xs text-gray-500 mb-2">Select issue types where this template should be available</p>
                <div className="grid grid-cols-3 gap-2">
                    {['Epic', 'Feature', 'Story', 'Task', 'Bug', 'Subtask'].map((type) => (
                        <label key={type} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.visibleTypes?.includes(type) || false}
                                onChange={(e) => {
                                    const newTypes = e.target.checked
                                        ? [...(formData.visibleTypes || []), type]
                                        : (formData.visibleTypes || []).filter(t => t !== type);
                                    setFormData({ ...formData, visibleTypes: newTypes });
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Active</label>
                    <p className="text-xs text-gray-500">Enable this template for use</p>
                </div>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Template</label>
                <div className="h-96 border rounded-md overflow-hidden">
                    <Editor
                        height="100%"
                        defaultLanguage="handlebars"
                        value={formData.prompt}
                        onChange={(value) => setFormData({ ...formData, prompt: value || '' })}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                        }}
                    />
                </div>
                <p className="mt-1 text-sm text-gray-500">Use {'{{variable}}'} syntax for dynamic values.</p>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Save Template
                </button>
            </div>
        </form>
    );
};
