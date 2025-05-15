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