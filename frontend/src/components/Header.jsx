import React from 'react';
import { Menu, Cpu, Database, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Header({ 
  title, 
  subtitle, 
  onMenuClick, 
  activeModel, 
  onModelChange, 
  modelsList = [],
  datasetRecords = 10000 
}) {
  const modelLabels = {
    'gradient_boosting': 'Gradient Boosting (99.2% Acc)',
    'random_forest': 'Random Forest (99.0% Acc)',
    'decision_tree': 'Decision Tree (95.0% Acc)',
    'logistic_regression': 'Logistic Regression (85.9% Acc)'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Title & mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right controls: Active model selector & status badges */}
      <div className="flex items-center gap-3">
        {/* Model Selector */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-blue-600 mr-2" />
          <span className="font-medium mr-1.5 text-slate-500 hidden md:inline">Active Model:</span>
          <select
            value={activeModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
          >
            {modelsList.length > 0 ? (
              modelsList.map(m => (
                <option key={m} value={m}>
                  {modelLabels[m] || m.replace('_', ' ').toUpperCase()}
                </option>
              ))
            ) : (
              <option value="gradient_boosting">Gradient Boosting</option>
            )}
          </select>
        </div>

        {/* Dataset indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span>AI4I 2020: {datasetRecords.toLocaleString()} rows</span>
        </div>
      </div>
    </header>
  );
}
