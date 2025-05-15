// WorkflowEditor.jsx - The drag-and-drop workflow editor
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, { 
  Controls, 
  Background, 
  MiniMap, 
  addEdge, 
  useNodesState, 
  useEdgesState 
} from 'reactflow';
import { useDispatch, useSelector } from 'react-redux';
import 'reactflow/dist/style.css';

import { fetchWorkflow, saveWorkflow, executeWorkflow } from '../store/workflowSlice';
import NodePanel from '../components/NodePanel';
import CustomNode from '../components/nodes/CustomNode';
import TaskNode from '../components/nodes/TaskNode';
import ConditionNode from '../components/nodes/ConditionNode';

const nodeTypes = {
  task: TaskNode,
  condition: ConditionNode,
  custom: CustomNode,
};

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentWorkflow, loading, error } = useSelector((state) => state.workflows);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchWorkflow(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentWorkflow) {
      setName(currentWorkflow.name || '');
      setNodes(currentWorkflow.nodes || []);
      setEdges(currentWorkflow.transitions || []);
    }
  }, [currentWorkflow]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const name = event.dataTransfer.getData('name');
      
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - 250,
        y: event.clientY - 70,
      };

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { label: name || `New ${type} Node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleSave = () => {
    const workflow = {
      id: id || `workflow_${Date.now()}`,
      name,
      nodes,
      transitions: edges,
    };
    
    dispatch(saveWorkflow(workflow));
    if (!id) {
      navigate(`/workflows/${workflow.id}`);
    }
  };

  const handleExecute = () => {
    if (id) {
      dispatch(executeWorkflow(id));
    }
  };

  if (loading && id) return <div>Loading workflow...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="workflow-editor">
      <div className="editor-header">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workflow Name"
          className="workflow-name-input"
        />
        <div className="editor-actions">
          <button onClick={handleSave}>Save Workflow</button>
          {id && <button onClick={handleExecute}>Execute Workflow</button>}
        </div>
      </div>
      
      <div className="editor-container">
        <NodePanel />
        <div className="reactflow-wrapper">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default WorkflowEditor;