
// store/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardApi from '../services/dashboardApi';

export const fetchActiveWorkflows = createAsyncThunk(
  'dashboard/fetchActiveWorkflows',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getActiveWorkflows();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTaskStatuses = createAsyncThunk(
  'dashboard/fetchTaskStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getTaskStatuses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    activeWorkflows: [],
    taskStatuses: [],
    loading: false,
    error: null,
  },
  reducers: {
    taskUpdated: (state, action) => {
      const index = state.taskStatuses.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.taskStatuses[index] = action.payload;
      } else {
        state.taskStatuses.push(action.payload);
      }
    },
    workflowUpdated: (state, action) => {
      const index = state.activeWorkflows.findIndex(wf => wf.id === action.payload.id);
      if (index !== -1) {
        state.activeWorkflows[index] = action.payload;
      } else {
        state.activeWorkflows.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active workflows
      .addCase(fetchActiveWorkflows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveWorkflows.fulfilled, (state, action) => {
        state.activeWorkflows = action.payload;
        state.loading = false;
      })
      .addCase(fetchActiveWorkflows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch task statuses
      .addCase(fetchTaskStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskStatuses.fulfilled, (state, action) => {
        state.taskStatuses = action.payload;
        state.loading = false;
      })
      .addCase(fetchTaskStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { taskUpdated, workflowUpdated } = dashboardSlice.actions;
export default dashboardSlice.reducer;