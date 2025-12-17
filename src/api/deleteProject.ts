import apiClient from './instances';

export const deleteProject = async (project_id: number) => {
  const response = await apiClient.delete(`/projects/${project_id}`);
  return response.data;
};
