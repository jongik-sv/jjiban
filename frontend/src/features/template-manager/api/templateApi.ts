import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface PromptTemplate {
    id: string;
    projectId?: string;
    name: string;
    description?: string;
    prompt: string;
    llmType: string;
    visibleColumns: string[];
    visibleTypes: string[];
    variables: Record<string, any>;
    isActive: boolean;
    createdAt: string;
}

export interface CreatePromptTemplateDto {
    name: string;
    description?: string;
    prompt: string;
    llmType: string;
    visibleColumns?: string[];
    visibleTypes?: string[];
    variables?: Record<string, any>;
    isActive?: boolean;
}

export interface UpdatePromptTemplateDto extends Partial<CreatePromptTemplateDto> { }

export const templateApi = {
    getAll: async (projectId: string): Promise<PromptTemplate[]> => {
        const response = await axios.get(`${API_URL}/api/projects/${projectId}/templates`);
        return response.data;
    },

    getOne: async (projectId: string, id: string): Promise<PromptTemplate> => {
        const response = await axios.get(`${API_URL}/api/projects/${projectId}/templates/${id}`);
        return response.data;
    },

    create: async (projectId: string, data: CreatePromptTemplateDto): Promise<PromptTemplate> => {
        const response = await axios.post(`${API_URL}/api/projects/${projectId}/templates`, data);
        return response.data;
    },

    update: async (projectId: string, id: string, data: UpdatePromptTemplateDto): Promise<PromptTemplate> => {
        const response = await axios.put(`${API_URL}/api/projects/${projectId}/templates/${id}`, data);
        return response.data;
    },

    delete: async (projectId: string, id: string): Promise<void> => {
        await axios.delete(`${API_URL}/api/projects/${projectId}/templates/${id}`);
    },
};
