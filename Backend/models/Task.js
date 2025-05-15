
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  nodeId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    type: String
  },
  assignedToType: {
    type: String,
    enum: ['vehicle', 'worker', 'system', 'other'],
    default: 'system'
  },
  priority: {
    type: Number,
    default: 0
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  scheduledFor: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  errorDetails: {
    message: String,
    code: String,
    timestamp: Date
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  executionContext: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

TaskSchema.index({ workflowId: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ parentTaskId: 1 });


TaskSchema.methods.startTask = function(assignedTo = null) {
  this.status = 'in_progress';
  if (assignedTo) {
    this.assignedTo = assignedTo;
  }
  return this.save();
};


TaskSchema.methods.completeTask = function(resultData = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  
  // Merge resultData into data
  if (this.data) {
    for (const [key, value] of Object.entries(resultData)) {
      this.data.set(key, value);
    }
  } else {
    this.data = new Map(Object.entries(resultData));
  }
  
  return this.save();
};


TaskSchema.methods.failTask = function(errorMessage, errorCode = null) {
  this.status = 'failed';
  this.errorDetails = {
    message: errorMessage,
    code: errorCode,
    timestamp: new Date()
  };
  return this.save();
};


TaskSchema.methods.retry = function() {
  if (this.retryCount < this.maxRetries) {
    this.retryCount += 1;
    this.status = 'pending';
    return this.save();
  } else {
    throw new Error(`Maximum retry count (${this.maxRetries}) exceeded`);
  }
};


TaskSchema.statics.findByWorkflow = function(workflowId) {
  return this.find({ workflowId }).sort({ createdAt: -1 });
};


TaskSchema.statics.findPendingTasks = function(limit = 100) {
  return this.find({ 
    status: 'pending',
    $or: [
      { scheduledFor: { $exists: false } },
      { scheduledFor: { $lte: new Date() } }
    ]
  })
  .sort({ priority: -1, createdAt: 1 })
  .limit(limit);
};

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;