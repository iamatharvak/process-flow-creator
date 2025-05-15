
const Workflow = require('./models/Workflow');
const Task = require('../models/Task');
const WorkflowExecutionEngine = require('../services/WorkflowExecutionEngine');


exports.getAllWorkflows = async (req, res) => {
  try {
    const { status, search, sort = 'updatedAt', order = 'desc' } = req.query;
    
    // Build query
    const query = { createdBy: req.user.userId };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    const workflows = await Workflow.find(query)
      .sort(sortOptions)
      .lean();
    
    res.status(200).json({ success: true, count: workflows.length, data: workflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch workflows', error: error.message });
  }
};


exports.getWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch workflow', error: error.message });
  }
};


exports.createWorkflow = async (req, res) => {
  try {
    const { name, description, nodes, transitions, startNodeId, tags, metadata } = req.body;
    
    const workflow = await Workflow.create({
      name,
      description,
      nodes: nodes || [],
      transitions: transitions || [],
      startNodeId,
      createdBy: req.user.userId,
      tags: tags || [],
      metadata: metadata || {}
    });
    
    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ success: false, message: 'Failed to create workflow', error: error.message });
  }
};


exports.updateWorkflow = async (req, res) => {
  try {
    const { name, description, nodes, transitions, startNodeId, status, tags, metadata } = req.body;
    
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    
    if (name) workflow.name = name;
    if (description !== undefined) workflow.description = description;
    if (nodes) workflow.nodes = nodes;
    if (transitions) workflow.transitions = transitions;
    if (startNodeId) workflow.startNodeId = startNodeId;
    if (status && ['draft', 'active', 'inactive', 'archived'].includes(status)) {
      workflow.status = status;
    }
    if (tags) workflow.tags = tags;
    if (metadata) {
      workflow.metadata = workflow.metadata || new Map();
      for (const [key, value] of Object.entries(metadata)) {
        workflow.metadata.set(key, value);
      }
    }
    
  
    if (nodes || transitions || startNodeId) {
      workflow.version += 1;
    }
    
    await workflow.save();
    
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ success: false, message: 'Failed to update workflow', error: error.message });
  }
};


exports.deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    // Check if there are active tasks for this workflow
    const activeTasks = await Task.countDocuments({
      workflowId: workflow._id,
      status: { $in: ['pending', 'in_progress'] }
    });
    
    if (activeTasks > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete workflow with ${activeTasks} active tasks`
      });
    }
    
    await workflow.remove();
    
    res.status(200).json({ success: true, message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ success: false, message: 'Failed to delete workflow', error: error.message });
  }
};


exports.cloneWorkflow = async (req, res) => {
  try {
    const sourceWorkflow = await Workflow.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    
    if (!sourceWorkflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    const clonedWorkflow = await sourceWorkflow.clone();
    
    res.status(201).json({ success: true, data: clonedWorkflow });
  } catch (error) {
    console.error('Error cloning workflow:', error);
    res.status(500).json({ success: false, message: 'Failed to clone workflow', error: error.message });
  }
};


exports.executeWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    if (workflow.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active workflows can be executed'
      });
    }
    
    const { initialData = {} } = req.body;
    
    const executionEngine = new WorkflowExecutionEngine(workflow, req.io);
    
   
    const result = await executionEngine.startExecution(initialData);
    
    res.status(200).json({
      success: true,
      message: 'Workflow execution started',
      data: result
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ success: false, message: 'Failed to execute workflow', error: error.message });
  }
};


exports.getActiveWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.findActiveWorkflows(req.user.userId);
    
    
    const workflowsWithTaskInfo = await Promise.all(workflows.map(async (workflow) => {
      const taskCounts = await Task.aggregate([
        { $match: { workflowId: workflow._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      const taskSummary = {
        pending: 0,
        in_progress: 0,
        completed: 0,
        failed: 0,
        cancelled: 0
      };
      
      taskCounts.forEach(item => {
        taskSummary[item._id] = item.count;
      });
      
      return {
        ...workflow.toObject(),
        taskSummary
      };
    }));
    
    res.status(200).json({ success: true, data: workflowsWithTaskInfo });
  } catch (error) {
    console.error('Error fetching active workflows:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active workflows', error: error.message });
  }
};