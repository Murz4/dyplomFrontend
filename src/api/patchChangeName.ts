import apiClient from './instances';

interface IChangeNameProps {
  name: string;
  surname: string;
}

export const patchChangeName = async ({ name, surname }: IChangeNameProps) => {
  try {
    const response = await apiClient.patch('/user/profile/{user_id}', { name: name, surname: surname });
    return response.data;
  } catch (error: any) {
    console.error('error:', error);

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(error.message || 'An error occurred while creating the project');
  }
};
