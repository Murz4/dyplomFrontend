import apiClient from './instances';

interface IRemoveUserFromTask {
  task_id: number;
  user_emails: string[];
}

export const deleteUserFromTask = async ({ task_id, user_emails }: IRemoveUserFromTask) => {
  try {
    const response = await apiClient.delete('/tasks/remove-user-from-task', {
      data: {
        task_id,
        user_emails,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error removing user from task:', error);

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(error.message || 'Failed to remove user from task');
  }
};
