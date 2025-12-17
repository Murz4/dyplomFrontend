import apiClient from './instances';

export type ProjectPayload = {
  name: string;
  purpose_id: number;
  description: string;
  users: string[];
};

export type ProjectResponse = {
  id: number;
  name: string;
  purpose_id: number;
  description: string;
  users: string[];
  created_at: string;
  updated_at: string;
};

export const postProject = async (payload: ProjectPayload): Promise<ProjectResponse> => {
  try {
    const response = await apiClient.post<ProjectResponse>('/projects', payload);
    return response.data;
  } catch (error: any) {
    console.error('error:', error);

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(error.message || 'An error occurred while creating the project');
  }
};
