import apiClient from './instances';

export const getPurposes = async () => {
  const response = await apiClient.get('/projects/purposes');
  return response.data;
};
