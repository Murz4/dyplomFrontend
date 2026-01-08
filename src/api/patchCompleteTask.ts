import apiClient from './instances';

interface IPatchCompleteTask {
  task_id: number;
  archive: boolean;
}

export const patchCompleteTask = async ({ task_id, archive }: IPatchCompleteTask) => {
  try {
    const response = await apiClient.patch('/tasks/archive-task', { task_id, archive });
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

    throw new Error(error.message || 'Failed to archive/unarchive task');
  }
};
