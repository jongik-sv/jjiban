import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Issue {
    id: string;
    projectId: string;
    type: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assigneeId?: string;
    docPath?: string;
    branchName?: string;
    createdAt: string;
    updatedAt: string;
}

export const issueApi = {
    getAll: async (): Promise<Issue[]> => {
        const response = await axios.get(`${API_URL}/issue`);
        return response.data;
    },

    updateStatus: async (id: string, status: string, order?: number): Promise<Issue> => {
        const response = await axios.patch(`${API_URL}/issue/${id}/status`, { status, order });
        return response.data;
    },

    getContextMenu: async (id: string): Promise<{ templates: Array<{ id: string; name: string; llmType: string; prompt: string }> }> => {
        const response = await axios.get(`${API_URL}/issue/${id}/context-menu`);
        return response.data;
    },
};
