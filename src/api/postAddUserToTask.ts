import apiClient from './instances';

interface IAddUserToTask {
  task_id: number;
  user_emails: string[];
}

export const postAddUserToTask = async ({ task_id, user_emails }: IAddUserToTask) => {
  try {
    const response = await apiClient.post('/tasks/add-user-to-task', {
      task_id,
      user_emails,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error adding users to task:', error);

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(error.message || 'Failed to add users to task');
  }
};
