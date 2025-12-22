import apiClient from './instances';

interface PatchArchiveProps {
  project_id: number | null;
  is_archived: boolean;
}

export const patchArchive = async (credentials: PatchArchiveProps) => {
  try {
    console.log('Patching archive with:', credentials);
    const response = await apiClient.patch(`/projects/${credentials.project_id}/change-archive-status`, {
      is_archived: credentials.is_archived,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error in patchArchive:', error);

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(error.message || 'Failed to update project archive status');
  }
};
