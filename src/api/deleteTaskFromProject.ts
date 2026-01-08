import apiClient from './instances';

interface IDeleteTask {
  task_id: number;
}

export const deleteTaskFromProject = async ({ task_id }: IDeleteTask) => {
  try {
    const response = await apiClient.delete(`/tasks/delete/${task_id}`);
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

    throw new Error(error.message || 'Failed delete task');
  }
};
