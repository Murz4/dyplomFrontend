import apiClient from './instances';

export const leaveProject = async (project_id: number | null) => {
  const response = await apiClient.delete(`/projects/${project_id}/leave-project`);
  return response.data;
};
