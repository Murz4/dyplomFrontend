import apiClient from './instances';

export const getRoles = async () => {
  const response = await apiClient.get('/projects/roles');
  return response.data;
};
