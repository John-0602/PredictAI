import React, { useState, useEffect } from 'react';
import {
  Gauge,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Cpu,
  Layers,
  BarChart2,
  LineChart as LineChartIcon,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../api';

export default function ModelPerformance({ activeModel, onModelChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModelKey, setSelectedModelKey] = useState('gradient_boosting');

  useEffect(() => {
    loadModelComparison();
  }, []);

  const loadModelComparison = async () => {
    try {
      setLoading(true);
      const res = await api.getModelComparison();
      setData(res);
      if (res.active_model) {
        setSelectedModelKey(res.active_model);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Evaluating machine learning benchmarks & ROC curves...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
        Failed to load model metrics: {error}
      </div>
    );
  }

  const models = data.models;
  const currentModel = models[selectedModelKey] || models[Object.keys(models)[0]];

  // Comparative bar chart data
  const metricsComparisonData = [
    {
      metric: 'Accuracy',
      'Logistic Regression': (models.logistic_regression?.accuracy * 100) || 0,
      'Decision Tree': (models.decision_tree?.accuracy * 100) || 0,
      'Random Forest': (models.random_forest?.accuracy * 100) || 0,
      'Gradient Boosting': (models.gradient_boosting?.accuracy * 100) || 0,
    },
    {
      metric: 'Recall',
      'Logistic Regression': (models.logistic_regression?.recall * 100) || 0,
      'Decision Tree': (models.decision_tree?.recall * 100) || 0,
      'Random Forest': (models.random_forest?.recall * 100) || 0,
      'Gradient Boosting': (models.gradient_boosting?.recall * 100) || 0,
    },
    {
      metric: 'Precision',
      'Logistic Regression': (models.logistic_regression?.precision * 100) || 0,
      'Decision Tree': (models.decision_tree?.precision * 100) || 0,
      'Random Forest': (models.random_forest?.precision * 100) || 0,
      'Gradient Boosting': (models.gradient_boosting?.precision * 100) || 0,
    },
    {
      metric: 'F1-Score',
      'Logistic Regression': (models.logistic_regression?.f1_score * 100) || 0,
      'Decision Tree': (models.decision_tree?.f1_score * 100) || 0,
      'Random Forest': (models.random_forest?.f1_score * 100) || 0,
      'Gradient Boosting': (models.gradient_boosting?.f1_score * 100) || 0,
    },
    {
      metric: 'ROC-AUC',
      'Logistic Regression': (models.logistic_regression?.roc_auc * 100) || 0,
      'Decision Tree': (models.decision_tree?.roc_auc * 100) || 0,
      'Random Forest': (models.random_forest?.roc_auc * 100) || 0,
      'Gradient Boosting': (models.gradient_boosting?.roc_auc * 100) || 0,
    }
  ];

  // ROC Curve combining all 4 models
  const rocPointsLength = Math.max(
    models.logistic_regression?.roc_curve?.length || 0,
    models.decision_tree?.roc_curve?.length || 0,
    models.random_forest?.roc_curve?.length || 0,
    models.gradient_boosting?.roc_curve?.length || 0
  );

  const combinedRocData = [];
  for (let i = 0; i < rocPointsLength; i++) {
    combinedRocData.push({
      fpr: models.gradient_boosting?.roc_curve?.[i]?.fpr ?? (i / (rocPointsLength - 1)),
      'Gradient Boosting': models.gradient_boosting?.roc_curve?.[i]?.tpr,
      'Random Forest': models.random_forest?.roc_curve?.[i]?.tpr,
      'Decision Tree': models.decision_tree?.roc_curve?.[i]?.tpr,
      'Logistic Regression': models.logistic_regression?.roc_curve?.[i]?.tpr
    });
  }

  // Confusion matrix breakdown
  const cm = currentModel.confusion_matrix;
  const totalTest = cm.true_negative + cm.false_positive + cm.false_negative + cm.true_positive;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
              Classifier Benchmark & Validation
            </span>
            <span className="text-xs text-slate-400">2,000 Test Records (Stratified 80/20)</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Machine Learning Model Comparison & Evaluation
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Trained and cross-validated across 4 distinct paradigms: Logistic Regression, Decision Tree, Random Forest, and Gradient Boosting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeModel !== selectedModelKey && (
            <button
              onClick={() => onModelChange(selectedModelKey)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
            >
              Activate {currentModel.name}
            </button>
          )}
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Comprehensive Performance Comparison</h3>
            <p className="text-xs text-slate-500">Evaluated on 2,000 holdout test instances (68 actual failures)</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            Recommended: Gradient Boosting
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall (Sensitivity)</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">ROC-AUC</th>
                <th className="py-2.5 px-3">Missed Failures (FN)</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(models).map(([key, m]) => {
                const isActive = activeModel === key;
                const isSelected = selectedModelKey === key;
                const fnCount = m.confusion_matrix.false_negative;

                return (
                  <tr
                    key={key}
                    onClick={() => setSelectedModelKey(key)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{m.name}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                            Active
                          </span>
                        )}
                        {key === data.best_model && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            Best F1
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{(m.precision * 100).toFixed(2)}%</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{(m.recall * 100).toFixed(2)}%</td>
                    <td className="py-3 px-3 font-bold text-blue-600">{(m.f1_score * 100).toFixed(2)}%</td>
                    <td className="py-3 px-3 font-semibold text-purple-600">{m.roc_auc.toFixed(4)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fnCount <= 13 ? 'bg-emerald-100 text-emerald-800' : fnCount <= 18 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {fnCount} missed
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onModelChange(key);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          isActive
                            ? 'bg-slate-100 text-slate-400 cursor-default'
                            : 'bg-white border border-slate-200 hover:border-blue-400 text-slate-700'
                        }`}
                      >
                        {isActive ? 'Current' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Selection Rationale Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Industrial Cost Function & Model Selection Rationale
          </div>
          <h3 className="text-sm font-bold text-white">
            Why Recall & F1-Score Trump Raw Accuracy in Predictive Maintenance
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            In manufacturing, a <strong>False Negative (missed machine failure)</strong> causes sudden catastrophic tool wreckage and tens of thousands of dollars in line downtime. A <strong>False Positive</strong> only triggers a 5-minute visual inspection. While naive accuracy is 96.6% even with zero predictions, <strong>Gradient Boosting (80.9% Recall, 87.3% F1)</strong> and <strong>Random Forest (98.4% ROC-AUC)</strong> provide the optimal balance between high catch rate and low false alarms.
          </p>
        </div>
      </div>

      {/* Confusion Matrix and Metrics Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Confusion Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Confusion Matrix: {currentModel.name}
              </h3>
              <p className="text-xs text-slate-500">Test set counts (2,000 samples)</p>
            </div>
            <select
              value={selectedModelKey}
              onChange={(e) => setSelectedModelKey(e.target.value)}
              className="text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            >
              {Object.entries(models).map(([k, m]) => (
                <option key={k} value={k}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* True Negative */}
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-center">
              <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">True Negative (TN)</span>
              <div className="text-2xl font-bold text-teal-900 mt-1">{cm.true_negative}</div>
              <p className="text-[11px] text-teal-700 mt-1">Correctly identified normal machine</p>
            </div>

            {/* False Positive */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">False Positive (FP)</span>
              <div className="text-2xl font-bold text-amber-900 mt-1">{cm.false_positive}</div>
              <p className="text-[11px] text-amber-700 mt-1">False alarm (unnecessary inspection)</p>
            </div>

            {/* False Negative */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">False Negative (FN)</span>
              <div className="text-2xl font-bold text-rose-900 mt-1">{cm.false_negative}</div>
              <p className="text-[11px] text-rose-700 mt-1">Critical: Missed machine breakdown!</p>
            </div>

            {/* True Positive */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">True Positive (TP)</span>
              <div className="text-2xl font-bold text-blue-900 mt-1">{cm.true_positive}</div>
              <p className="text-[11px] text-blue-700 mt-1">Failure successfully caught ahead of time</p>
            </div>
          </div>
        </div>

        {/* Metrics Bar Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Comparative Metrics Across All Models</h3>
            <p className="text-xs text-slate-500">Side-by-side comparison (0 – 100%)</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  formatter={(val) => [`${val.toFixed(1)}%`, 'Score']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Logistic Regression" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Decision Tree" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Random Forest" fill="#0d9488" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Gradient Boosting" fill="#2563eb" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROC Curves Multi-Model Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-blue-600" />
              Receiver Operating Characteristic (ROC Curves)
            </h3>
            <p className="text-xs text-slate-500">True Positive Rate (Sensitivity) vs False Positive Rate (1 - Specificity)</p>
          </div>
          <div className="text-xs text-slate-500">
            Random Forest AUC: <strong className="text-teal-600 font-mono">0.9839</strong> | Gradient Boosting AUC: <strong className="text-blue-600 font-mono">0.9602</strong>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedRocData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <XAxis dataKey="fpr" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 1]} tickFormatter={(v) => v.toFixed(2)} label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 1]} label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                formatter={(val) => [(val * 100).toFixed(1) + '%', 'TPR']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
              <Line type="monotone" dataKey="Gradient Boosting" stroke="#2563eb" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Random Forest" stroke="#0d9488" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Decision Tree" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Logistic Regression" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
