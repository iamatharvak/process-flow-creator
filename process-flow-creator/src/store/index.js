// Redux store configuration - store/index.js
import { configureStore } from '@reduxjs/toolkit';
import workflowReducer from './workflowSlice';
import dashboardReducer from './dashboardSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    workflows: workflowReducer,
    dashboard: dashboardReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

// store/workflowSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import workflowApi from '../services/workflowApi';

export const fetchWorkflows = createAsyncThunk(
  'workflows/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workflowApi.getWorkflows();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWorkflow = createAsyncThunk(
  'workflows/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await workflowApi.getWorkflow(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveWorkflow = createAsyncThunk(
  'workflows/save',
  async (workflow, { rejectWithValue }) => {
    try {
      const response = workflow.id 
        ? await workflowApi.updateWorkflow(workflow)
        : await workflowApi.createWorkflow(workflow);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const executeWorkflow = createAsyncThunk(
  'workflows/execute',
  async (id, { rejectWithValue }) => {
    try {
      const response = await workflowApi.executeWorkflow(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const workflowSlice = createSlice({
  name: 'workflows',
  initialState: {
    workflows: [],
    currentWorkflow: null,
    executionResults: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentWorkflow: (state) => {
      state.currentWorkflow = null;
    },
    clearExecutionResults: (state) => {
      state.executionResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all workflows
      .addCase(fetchWorkflows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.workflows = action.payload;
        state.loading = false;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single workflow
      .addCase(fetchWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflow.fulfilled, (state, action) => {
        state.currentWorkflow = action.payload;
        state.loading = false;
      })
      .addCase(fetchWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Save workflow
      .addCase(saveWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveWorkflow.fulfilled, (state, action) => {
        state.currentWorkflow = action.payload;
        
        // Update workflow in the list if it exists
        const index = state.workflows.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.workflows[index] = action.payload;
        } else {
          state.workflows.push(action.payload);
        }
        
        state.loading = false;
      })
      .addCase(saveWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Execute workflow
      .addCase(executeWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeWorkflow.fulfilled, (state, action) => {
        state.executionResults = action.payload;
        state.loading = false;
      })
      .addCase(executeWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentWorkflow, clearExecutionResults } = workflowSlice.actions;
export default workflowSlice.reducer;