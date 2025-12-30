import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import RecordManagement from './pages/RecordManagement';
import RoleManagement from './pages/RoleManagement';
import UnitManagement from './pages/UnitManagement';
import CategoryManagement from './pages/CategoryManagement';
import RegulationManagement from './pages/RegulationManagement';
import ReportManagement from './pages/ReportManagement';
import SystemConfig from './pages/SystemConfig';
import WorkflowManagement from './pages/WorkflowManagement';
import Profile from './pages/Profile';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Chatbot from './components/chatbot/Chatbot';
import './index.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState('dashboard');

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Đang tải...</div>;

  if (!user) return <LoginPage />;

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard onViewChange={setView} />;
      case 'users': return <UserManagement />;
      case 'my-records': return <RecordManagement mode="personal" />;
      case 'process-records': return <RecordManagement mode="process" />;
      case 'all-records': return <RecordManagement mode="all" />;
      case 'reports': return <ReportManagement />;
      case 'roles': return <RoleManagement />;
      case 'units': return <UnitManagement />;
      case 'categories': return <CategoryManagement />;
      case 'regulations': return <RegulationManagement />;
      case 'system-config': return <SystemConfig />;
      case 'workflows': return <WorkflowManagement />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeView={view} onViewChange={setView} />
      <Header onViewChange={setView} />
      <main className="main-content">
        <div className="content-wrapper">
          {renderView()}
        </div>
        <Footer />
      </main>
      <Chatbot />
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;