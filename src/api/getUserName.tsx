import apiClient from './instances';

interface IResponse {
  full_name: string;
  email: string;
}

export const getUserName = async () => {
  const response = await apiClient.get<IResponse>('/user/me');
  return response.data;
};
