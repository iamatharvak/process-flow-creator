// components/nodes/TaskNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const TaskNode = ({ data, isConnectable }) => {
  return (
    <div className="task-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="node-content">
        <div className="node-header">{data.label}</div>
        <div className="node-body">
          {data.description && <p>{data.description}</p>}
          {data.status && <div className="status-badge">{data.status}</div>}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(TaskNode);

// components/nodes/ConditionNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const ConditionNode = ({ data, isConnectable }) => {
  return (
    <div className="condition-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="node-content">
        <div className="node-header">{data.label}</div>
        <div className="node-body">
          {data.condition && <p>If: {data.condition}</p>}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '25%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '75%' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(ConditionNode);

// components/nodes/CustomNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, isConnectable }) => {
  return (
    <div className="custom-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="node-content">
        <div className="node-header">{data.label}</div>
        <div className="node-body">
          {data.customData && (
            <div className="custom-data">
              {Object.entries(data.customData).map(([key, value]) => (
                <div key={key} className="data-item">
                  <span className="key">{key}:</span>
                  <span className="value">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(CustomNode);