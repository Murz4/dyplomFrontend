import apiClient from './instances';

interface IPostAddMembers {
  members: string[];
  project_id: number | null;
}

export const postAddMembers = async ({ project_id, members }: IPostAddMembers) => {
  try {
    const response = await apiClient.post(`/projects/add-user-to-project/${project_id}`, { emails: members });
    return response.data;
  } catch (error: any) {
    console.error('error:', error);

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(error.message || 'Invalid add member');
  }
};
