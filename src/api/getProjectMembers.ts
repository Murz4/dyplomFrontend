import apiClient from './instances';

export const getProjectMembers = async (project_id: number | null) => {
  const response = await apiClient.get(`/projects/${project_id}/members`);
  return response.data;
};
