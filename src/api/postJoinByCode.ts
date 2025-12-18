import apiClient from './instances';

export const postJoinByCode = async (code: string) => {
  try {
    const response = await apiClient.post('/projects/join', code);
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
