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