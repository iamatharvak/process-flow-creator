import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Dashboard from './pages/Dashboard';
import WorkflowEditor from './pages/WorkflowEditor';
import WorkflowList from './pages/WorkflowList';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/workflows" element={<ProtectedRoute><WorkflowList /></ProtectedRoute>} />
              <Route path="/workflows/new" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
              <Route path="/workflows/:id" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
};

export default App;