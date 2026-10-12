import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import DatasetExplorer from './pages/DatasetExplorer';
import EdaAnalytics from './pages/EdaAnalytics';
import ModelPerformance from './pages/ModelPerformance';
import ExplainableAI from './pages/ExplainableAI';
import Maintenance from './pages/Maintenance';
import History from './pages/History';
import AboutProject from './pages/AboutProject';
import { api } from './api';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeModel, setActiveModel] = useState('gradient_boosting');
  const [modelsList, setModelsList] = useState([]);
  const [openTasksCount, setOpenTasksCount] = useState(0);

  useEffect(() => {
    // Fetch active model on mount
    api.getActiveModel()
      .then(res => {
        if (res.active_model) setActiveModel(res.active_model);
        if (res.available_models) setModelsList(res.available_models);
      })
      .catch(err => console.error('Could not fetch active model:', err));

    // Fetch tasks count
    api.getMaintenanceTasks()
      .then(tasks => {
        const active = tasks.filter(t => t.status !== 'Completed').length;
        setOpenTasksCount(active);
      })
      .catch(err => console.error('Could not fetch tasks:', err));
  }, [activePage]);

  const handleModelChange = async (newModel) => {
    try {
      await api.switchActiveModel(newModel);
      setActiveModel(newModel);
    } catch (err) {
      alert(`Error switching model: ${err.message}`);
    }
  };

  const pageMeta = {
    dashboard: {
      title: 'Executive Industrial Dashboard',
      subtitle: 'Real-time telemetry overview, machine health status, and failure trend analytics'
    },
    prediction: {
      title: 'Machine Failure Prediction',
      subtitle: 'Single-instance parameter simulation & batch CSV model inference'
    },
    dataset: {
      title: 'Dataset Explorer',
      subtitle: 'Browse, search, and verify AI4I 2020 predictive maintenance records'
    },
    eda: {
      title: 'Exploratory Data Analysis',
      subtitle: 'Histograms, sensor correlations, power envelope trends, and failure divergence'
    },
    models: {
      title: 'Machine Learning Model Performance',
      subtitle: 'Benchmarking 4 classification algorithms, confusion matrices, and ROC curves'
    },
    explainability: {
      title: 'Explainable AI & Domain Insights',
      subtitle: 'Feature importance attributions and physical mechanical failure analysis'
    },
    maintenance: {
      title: 'Maintenance Tasks & Condition SOPs',
      subtitle: 'Standard operating procedures, work order creation, and technician tracking'
    },
    history: {
      title: 'Prediction Audit History',
      subtitle: 'Historical inference log stored in SQLite with full telemetry parameters'
    },
    about: {
      title: 'Academic Documentation & Literature Survey',
      subtitle: '22MDC56 Lab project scope, team members, 10 references, and architecture'
    }
  };

  const currentMeta = pageMeta[activePage] || {
    title: 'PredictAI',
    subtitle: 'Smart Predictive Maintenance'
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'prediction':
        return <Prediction activeModel={activeModel} setActivePage={setActivePage} />;
      case 'dataset':
        return <DatasetExplorer />;
      case 'eda':
        return <EdaAnalytics />;
      case 'models':
        return <ModelPerformance activeModel={activeModel} onModelChange={handleModelChange} />;
      case 'explainability':
        return <ExplainableAI activeModel={activeModel} />;
      case 'maintenance':
        return <Maintenance />;
      case 'history':
        return <History />;
      case 'about':
        return <AboutProject />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Dark Navy Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        openTasksCount={openTasksCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Header */}
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onMenuClick={() => setIsMobileOpen(true)}
          activeModel={activeModel}
          onModelChange={handleModelChange}
          modelsList={modelsList}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>

        {/* System Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
          <p>
            PredictAI — Smart Predictive Maintenance &bull; 22MDC56 Machine Learning Laboratory &bull; Powered by FastAPI & React
          </p>
        </footer>
      </div>
    </div>
  );
}
