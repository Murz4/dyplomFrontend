import apiClient from './instances';

interface IChangeRoleProps {
  project_id: number | null;
  role_id: number;
  user_email: string;
}

export const patchChangeRole = async ({ project_id, user_email, role_id }: IChangeRoleProps) => {
  try {
    const response = await apiClient.patch(`/projects/${project_id}/change-member-role`, {
      user_email: user_email,
      role_id: role_id,
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

    throw new Error(error.message || 'Failed to update password');
  }
};
