import apiClient from './instances';

export const getProjectMember = async (project_id: number | null | undefined, user_id: number) => {
  const response = await apiClient.get(`/projects/${project_id}/members/${user_id}`);
  return response.data;
};
