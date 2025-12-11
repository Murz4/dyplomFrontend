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
    console.error('error:', error?.response?.data || error.message);
    throw new Error('try again');
  }
};
