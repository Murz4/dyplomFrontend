import apiClient from './instances';

export const getJoinLink = async (token: string | null) => {
  const response = await apiClient.get(`/projects/join/${token}`);
  return response.data;
};
