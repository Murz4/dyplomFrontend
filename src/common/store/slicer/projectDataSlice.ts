import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectState {
  projectId: number | null;
  projectName: string;
}

const initialState: ProjectState = {
  projectId: null,
  projectName: '',
};

interface SetProjectPayload {
  id: number;
  name: string;
}

const projectDataSlice = createSlice({
  name: 'projectData',
  initialState,
  reducers: {
    setProject(state, action: PayloadAction<SetProjectPayload>) {
      state.projectId = action.payload.id;
      state.projectName = action.payload.name;
    },
    clearProject(state) {
      state.projectId = null;
      state.projectName = '';
    },
  },
});

export const { setProject, clearProject } = projectDataSlice.actions;

export default projectDataSlice.reducer;
