import apiClient from './instances';

interface IChangePasswordProps {
  old_password: string;
  new_password: string;
}

export const patchChangePassword = async ({ old_password, new_password }: IChangePasswordProps) => {
  try {
    const response = await apiClient.patch('/user/profile/me/change_password', {
      old_password: old_password,
      new_password: new_password,
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
