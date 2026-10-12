import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Database,
  BarChart3,
  Gauge,
  Brain,
  Wrench,
  History,
  BookOpen,
  Activity,
  Layers
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen, openTasksCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Overview' },
    { id: 'prediction', label: 'Failure Prediction', icon: Cpu, category: 'Inference' },
    { id: 'dataset', label: 'Dataset Explorer', icon: Database, category: 'Data & Analytics' },
    { id: 'eda', label: 'EDA & Analytics', icon: BarChart3, category: 'Data & Analytics' },
    { id: 'models', label: 'Model Performance', icon: Gauge, category: 'Machine Learning' },
    { id: 'explainability', label: 'Explainable AI', icon: Brain, category: 'Machine Learning' },
    { id: 'maintenance', label: 'Maintenance Tasks', icon: Wrench, badge: openTasksCount > 0 ? openTasksCount : null, category: 'Operations' },
    { id: 'history', label: 'Prediction History', icon: History, category: 'Operations' },
    { id: 'about', label: 'About Project', icon: BookOpen, category: 'Documentation' },
  ];

  const handleSelect = (id) => {
    setActivePage(id);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white tracking-tight">PredictAI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">v1.0</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Predictive Maintenance</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            // Show category label if first item or category changes
            const showCategory = index === 0 || navItems[index - 1].category !== item.category;

            return (
              <React.Fragment key={item.id}>
                {showCategory && (
                  <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {item.category}
                  </div>
                )}
                <button
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 font-medium text-[11px]">Backend Connected</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">22MDC56 Lab</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 leading-tight">
            AI4I 2020 Predictive Maintenance
          </div>
        </div>
      </aside>
    </>
  );
}
