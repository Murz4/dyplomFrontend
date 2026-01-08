import apiClient from './instances';

interface IUpdateTaskPayload {
  name?: string;
  description?: string | null;
  priority_id?: number | string;
  start_at?: string;
  deadline_at?: string;
  without_time?: boolean;
}

interface IUpdateTaskParams {
  task_id: number | string;
  payload: IUpdateTaskPayload;
}

export const patchTaskUpdate = async ({ task_id, payload }: IUpdateTaskParams) => {
  try {
    const response = await apiClient.patch(`/tasks/update/${task_id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error('Error updating task:', error);

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0];
      throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
    }

    throw new Error(error.message || 'Failed to update task');
  }
};
