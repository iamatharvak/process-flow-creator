// models/Workflow.js - MongoDB Workflow schema
const mongoose = require('mongoose');

// Node schema - represents a node in the workflow
const NodeSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['task', 'condition', 'custom'] 
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    label: { type: String, required: true },
    description: { type: String },
    condition: { type: String },
    customData: { type: Map, of: mongoose.Schema.Types.Mixed }
  }
});

// Transition schema - represents connections between nodes
const TransitionSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true 
  },
  source: { 
    type: String, 
    required: true, 
    ref: 'Node' 
  },
  sourceHandle: { 
    type: String
  },
  target: { 
    type: String, 
    required: true, 
    ref: 'Node' 
  },
  targetHandle: { 
    type: String
  },
  label: { 
    type: String 
  },
  condition: { 
    type: String 
  },
  priority: { 
    type: Number, 
    default: 0 
  }
});

// Workflow schema - main schema for workflow definition
const WorkflowSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    trim: true 
  },
  nodes: [NodeSchema],
  transitions: [TransitionSchema],
  startNodeId: { 
    type: String 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  tags: [String],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true 
});

// Create an index for faster lookups
WorkflowSchema.index({ name: 1, createdBy: 1, status: 1 });

// Method to clone a workflow
WorkflowSchema.methods.clone = function() {
  const newWorkflow = new Workflow({
    name: `${this.name} - Copy`,
    description: this.description,
    nodes: this.nodes,
    transitions: this.transitions,
    startNodeId: this.startNodeId,
    createdBy: this.createdBy,
    status: 'draft',
    version: 1,
    tags: this.tags,
    metadata: this.metadata
  });
  
  return newWorkflow.save();
};

// Method to activate a workflow
WorkflowSchema.methods.activate = function() {
  this.status = 'active';
  return this.save();
};

// Static method to find active workflows
WorkflowSchema.statics.findActiveWorkflows = function(userId) {
  return this.find({ 
    createdBy: userId, 
    status: 'active' 
  }).sort({ updatedAt: -1 });
};

const Workflow = mongoose.model('Workflow', WorkflowSchema);

module.exports = Workflow;