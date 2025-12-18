import apiClient from './instances';

export const patchArchive = async (credentials: { project_id: number | null; is_archived: boolean }) => {
  console.log('Patching archive with:', credentials);
  const response = await apiClient.patch(`/projects/${credentials.project_id}/change-archive-status`, {
    is_archived: credentials.is_archived,
  });
  return response;
};
