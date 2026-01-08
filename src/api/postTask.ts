import apiClient from './instances';

export type ProjectPayload = {
  project_id: number;
  name: string;
  priority_id: number;
  description: string;
  start_date: string;
  start_time: string;
  deadline_date: string;
  deadline_time: string;
  users: number[];
  without_time: boolean;
};

export const postTask = async (payload: ProjectPayload) => {
  console.log('resssss', payload);

  try {
    const response = await apiClient.post('/tasks/create', payload);
    console.log('resssss', payload);
    return response.data;
  } catch (error: any) {
    console.error('error:', error);

    throw error;
  }
};
