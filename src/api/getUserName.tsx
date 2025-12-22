import apiClient from './instances';

interface IResponse {
  name: string;
  surname: string;
  email: string;
}

export const getUserName = async () => {
  const response = await apiClient.get<IResponse>('/user/profile/me');
  console.log('res', response.data);
  return response.data;
};
