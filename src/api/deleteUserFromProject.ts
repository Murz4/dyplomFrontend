import apiClient from './instances';

interface IDeleteUserFromProjectProps {
  project_id: number | null;
  user_id: number | null;
}

export const deleteUserFromProject = async ({ project_id, user_id }: IDeleteUserFromProjectProps) => {
  try {
    const response = await apiClient.delete(`/projects/${project_id}/users/${user_id}`);
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

    throw new Error(error.message || 'Failed to update fullname');
  }
};
