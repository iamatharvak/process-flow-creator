// components/NodePanel.jsx - Draggable node panel
import React from 'react';

const nodeTypes = [
  { type: 'task', name: 'Assign Task', color: '#ff6b6b' },
  { type: 'task', name: 'Process Task', color: '#4ecdc4' },
  { type: 'task', name: 'Complete Task', color: '#45b7d1' },
  { type: 'condition', name: 'Condition', color: '#f9c74f' },
  { type: 'custom', name: 'Custom Node', color: '#a3a3a3' },
];

const NodePanel = () => {
  const onDragStart = (event, nodeType, nodeName) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('name', nodeName);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="node-panel">
      <div className="panel-header">Node Types</div>
      <div className="node-list">
        {nodeTypes.map((node, index) => (
          <div
            key={index}
            className="dnd-node"
            style={{ backgroundColor: node.color }}
            onDragStart={(e) => onDragStart(e, node.type, node.name)}
            draggable
          >
            {node.name}
          </div>
        ))}
      </div>
      <div className="panel-info">
        <p>Drag and drop nodes to create your workflow.</p>
        <p>Connect nodes to define transitions.</p>
      </div>
    </div>
  );
};

export default NodePanel;