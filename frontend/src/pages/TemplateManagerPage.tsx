import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TemplateList } from '../features/template-manager/ui/TemplateList';
import { TemplateEditor } from '../features/template-manager/ui/TemplateEditor';
import { TemplatePreview } from '../features/template-manager/ui/TemplatePreview';
import { templateApi, type PromptTemplate, type CreatePromptTemplateDto } from '../features/template-manager/api/templateApi';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export const TemplateManagerPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [view, setView] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | undefined>(undefined);
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: CreatePromptTemplateDto) => templateApi.create(projectId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates', projectId] });
            setView('list');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreatePromptTemplateDto) => templateApi.update(projectId!, selectedTemplate!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates', projectId] });
            setView('list');
            setSelectedTemplate(undefined);
        },
    });

    if (!projectId) return <div>Project ID is missing</div>;

    const handleSave = async (data: CreatePromptTemplateDto) => {
        if (view === 'create') {
            await createMutation.mutateAsync(data);
        } else if (view === 'edit' && selectedTemplate) {
            await updateMutation.mutateAsync(data);
        }
    };

    return (
        <div className="container mx-auto p-6">
            {view === 'list' && (
                <TemplateList
                    projectId={projectId}
                    onCreate={() => {
                        setSelectedTemplate(undefined);
                        setView('create');
                    }}
                    onEdit={(template) => {
                        setSelectedTemplate(template);
                        setView('edit');
                    }}
                    onPreview={(template) => {
                        setSelectedTemplate(template);
                        setView('preview');
                    }}
                />
            )}

            {(view === 'create' || view === 'edit') && (
                <div>
                    <h2 className="text-xl font-bold mb-4">
                        {view === 'create' ? 'Create New Template' : 'Edit Template'}
                    </h2>
                    <TemplateEditor
                        initialData={selectedTemplate}
                        onSave={handleSave}
                        onCancel={() => {
                            setView('list');
                            setSelectedTemplate(undefined);
                        }}
                    />
                </div>
            )}

            {view === 'preview' && selectedTemplate && (
                <TemplatePreview
                    template={selectedTemplate}
                    projectId={projectId}
                    onBack={() => {
                        setView('list');
                        setSelectedTemplate(undefined);
                    }}
                />
            )}
        </div>
    );
};

