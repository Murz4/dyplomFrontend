import apiClient from './instances';

export const patchArchive = async (credentials: { project_id: number | null; is_archived: boolean }) => {
  try {
    console.log('Patching archive with:', credentials);
    const response = await apiClient.patch(`/projects/${credentials.project_id}/change-archive-status`, {
      is_archived: credentials.is_archived,
    });
    return response;
  } catch (error: any) {
    if (error.response) {
      console.error('PatchArchive server error:', error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
};
