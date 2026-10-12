import React, { useState, useEffect } from 'react';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Activity,
  Layers,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../api';

export default function ExplainableAI({ activeModel }) {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedModel, setSelectedModel] = useState('gradient_boosting');

  useEffect(() => {
    loadExplainability();
  }, []);

  const loadExplainability = async () => {
    try {
      setLoading(true);
      const [expRes, insRes] = await Promise.all([
        api.getGlobalExplainability(),
        api.getDomainInsights()
      ]);
      setData(expRes);
      setInsights(insRes);
      if (activeModel && expRes.models_importance[activeModel]) {
        setSelectedModel(activeModel);
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
        <p className="text-xs text-slate-500 font-medium">Computing model feature attributions & explainability factors...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
        Failed to load explainability data: {error}
      </div>
    );
  }

  const modelImportance = data.models_importance[selectedModel]?.importance || {};
  const chartData = Object.entries(modelImportance)
    .map(([feature, weight]) => ({
      feature: feature.replace(' [rpm]', '').replace(' [Nm]', '').replace(' [min]', '').replace(' [K]', ''),
      rawFeature: feature,
      weight: Math.round(weight * 1000) / 10,
      description: data.feature_descriptions[feature] || 'Operational feature'
    }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 uppercase tracking-wider">
            Explainable AI (XAI)
          </span>
          <span className="text-xs text-slate-400">Global Feature Importance & Local Attribution</span>
        </div>
        <h2 className="text-base font-bold text-slate-900 mt-1">
          Machine Decision Transparency & Physical Mechanics
        </h2>
        <p className="text-xs text-slate-500 max-w-3xl mt-0.5">
          Interpreting the decision logic of trained classifiers. Demonstrates how physical domain features (Torque, Tool Overstrain, and Thermal Gradients) govern failure likelihood.
        </p>
      </div>

      {/* Global Feature Importance Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              Global Feature Importance Ranking ({data.models_importance[selectedModel]?.name || selectedModel})
            </h3>
            <p className="text-xs text-slate-500">Relative contribution percentage (0 – 100%)</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            >
              {Object.entries(data.models_importance).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
            >
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="%" domain={[0, 'auto']} />
              <YAxis
                type="category"
                dataKey="feature"
                tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 500 }}
                width={130}
              />
              <Tooltip
                formatter={(val, name, item) => [`${val}% contribution`, item.payload.rawFeature]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
              />
              <Bar dataKey="weight" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-purple-50/60 border border-purple-200/60 rounded-xl text-xs text-purple-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span>
            <strong>Key Insight:</strong> Tool Overstrain (Torque × Tool Wear) and Spindle Torque constitute over 55% of the total predictive power, aligning directly with Stephan Matzka's mechanical failure equations.
          </span>
        </div>
      </div>

      {/* Physical Interpretations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartData.slice(0, 6).map((item) => (
          <div key={item.rawFeature} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs font-mono">{item.rawFeature}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                {item.weight}% weight
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Practical Industrial & Business Insights */}
      {insights && insights.insights && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Actionable Industrial Insights & Operational Rules</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Empirical patterns extracted from 10,000 instances to guide plant maintenance strategy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.insights.map((ins, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{ins.title}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {ins.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Observed Behavior:</strong> {ins.finding}
                </p>
                <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-lg text-xs text-blue-900">
                  <strong>Recommended Policy:</strong> {ins.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic Disclosure Alert */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Academic Disclaimers & Causation Boundary:</span>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Machine learning models identify predictive statistical associations within sensor telemetry. They do not demonstrate absolute physical causation. Condition-based maintenance recommendations are designed as engineering decision support, not an automated safety shutdown override.
          </p>
        </div>
      </div>
    </div>
  );
}
