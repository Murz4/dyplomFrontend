import apiClient from './instances';

interface IGetTasksProps {
  year: number;
  month: number;
}

interface ITask {
  project_id: number;
  task_id: number;
  name: string;
  description: string;
  priority_id: number;
  start_at: string;
  deadline_at: string;
  is_overdue: boolean;
  is_completed: boolean;
}

export const getTasks = async ({ year, month }: IGetTasksProps): Promise<ITask[]> => {
  try {
    const response = await apiClient.get('/tasks/calendar/tasks', {
      params: {
        year: year,
        month: month,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('error:', error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(error.message || 'Failed to fetch tasks');
  }
};
