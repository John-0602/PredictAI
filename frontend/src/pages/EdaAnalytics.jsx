import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  Thermometer,
  Zap,
  Info,
  ScatterChart as ScatterIcon,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { api } from '../api';

export default function EdaAnalytics() {
  const [distData, setDistData] = useState(null);
  const [corrData, setCorrData] = useState(null);
  const [scatterData, setScatterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFeature, setSelectedFeature] = useState('Rotational speed [rpm]');

  useEffect(() => {
    loadEda();
  }, []);

  const loadEda = async () => {
    try {
      setLoading(true);
      const [dist, corr, scatter] = await Promise.all([
        api.getEdaDistributions(),
        api.getEdaCorrelations(),
        api.getEdaScatter(350)
      ]);
      setDistData(dist);
      setCorrData(corr);
      setScatterData(scatter);
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
        <p className="text-xs text-slate-500 font-medium">Computing exploratory distributions and correlation heatmaps...</p>
      </div>
    );
  }

  if (error || !distData || !corrData) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
        Failed to load EDA analytics: {error}
      </div>
    );
  }

  const featureOptions = [
    'Rotational speed [rpm]',
    'Torque [Nm]',
    'Tool wear [min]',
    'Air temperature [K]',
    'Process temperature [K]',
    'Temp_difference',
    'Power_W'
  ];

  const currentHistogram = distData.histograms[selectedFeature] || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 uppercase tracking-wider">
            Exploratory Data Analysis
          </span>
          <span className="text-xs text-slate-400">Descriptive & Correlation Statistics</span>
        </div>
        <h2 className="text-base font-bold text-slate-900 mt-1">
          Industrial Sensor Distributions & Anomaly Boundaries
        </h2>
        <p className="text-xs text-slate-500 max-w-3xl mt-0.5">
          Detailed inspection of physical interactions between spindle rotational dynamics, thermodynamics (ΔT), and material fatigue life across 10,000 milling cycles.
        </p>
      </div>

      {/* Feature Distribution with Failure breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Sensor Distribution Histogram (Normal vs Failure)
            </h3>
            <p className="text-xs text-slate-500">Distribution across 15 binned intervals</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Parameter:</span>
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            >
              {featureOptions.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentHistogram} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <XAxis dataKey="bin_range" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="normal" name="Normal (Safe)" fill="#0d9488" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="failure" name="Machine Failure" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensor Comparison Table: Normal vs Failure */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Sensor Value Divergence: Healthy vs Failure Cycles
            </h3>
            <p className="text-xs text-slate-500">Noticeable deviations reveal critical failure triggers</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">AI4I Empirical Means</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Sensor Parameter</th>
                <th className="py-2.5 px-3">Healthy Mean (0)</th>
                <th className="py-2.5 px-3">Failure Mean (1)</th>
                <th className="py-2.5 px-3">Healthy Median</th>
                <th className="py-2.5 px-3">Failure Median</th>
                <th className="py-2.5 px-3">Variance Impact (% Change)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(distData.comparison).map(([feature, stats]) => {
                const isSignif = Math.abs(stats.difference_pct) > 10;
                return (
                  <tr key={feature} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 font-mono text-[11px]">{feature}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-medium">{stats.normal_mean}</td>
                    <td className="py-2.5 px-3 text-rose-700 font-bold">{stats.failure_mean}</td>
                    <td className="py-2.5 px-3 text-slate-600">{stats.normal_median}</td>
                    <td className="py-2.5 px-3 text-slate-600">{stats.failure_median}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSignif
                          ? stats.difference_pct > 0 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {stats.difference_pct > 0 ? `+${stats.difference_pct}%` : `${stats.difference_pct}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensor Dynamics Scatter & Correlation Heatmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot: Rotational Speed vs Torque */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Rotational Speed vs Torque</h3>
              <span className="text-[11px] font-semibold text-slate-400">Power Envelope</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Physical inverse hyperbolic curve (Torque \u221d 1 / RPM). High-speed / high-torque outliers correlate with Power Failures (PWF).
            </p>
          </div>

          <div className="h-64 my-3">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                <XAxis type="number" dataKey="rot_speed" name="Speed" unit=" RPM" tick={{ fontSize: 10, fill: '#64748b' }} domain={[1000, 3000]} />
                <YAxis type="number" dataKey="torque" name="Torque" unit=" Nm" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 85]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                {scatterData && (
                  <>
                    <Scatter
                      name="Normal Cycles"
                      data={scatterData.filter(d => d.machine_failure === 0)}
                      fill="#0d9488"
                      opacity={0.4}
                    />
                    <Scatter
                      name="Failures"
                      data={scatterData.filter(d => d.machine_failure === 1)}
                      fill="#ef4444"
                      shape="cross"
                    />
                  </>
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-teal-700">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" /> Normal Operational
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 font-bold">
              <span className="w-2.5 h-2.5 bg-rose-500 inline-block" /> Failures (Outlier Envelope)
            </span>
          </div>
        </div>

        {/* Correlation Matrix Heatmap */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Pearson Correlation Matrix</h3>
              <span className="text-[11px] font-semibold text-slate-400">Inter-Feature Heatmap</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Strong negative correlation between Rotational Speed and Torque (-0.88), strong positive correlation with Machine failure for Torque and Tool overstrain.
            </p>
          </div>

          <div className="overflow-x-auto my-3">
            <table className="w-full text-center text-[10px]">
              <thead>
                <tr>
                  <th className="py-1 px-1 text-left font-semibold text-slate-400">Feature</th>
                  {corrData.features.map(f => (
                    <th key={f} className="py-1 px-1 font-semibold text-slate-600 truncate max-w-[50px]" title={f}>
                      {f.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {corrData.matrix.map((row) => (
                  <tr key={row.feature}>
                    <td className="py-1 px-1 text-left font-semibold text-slate-700 truncate max-w-[80px]" title={row.feature}>
                      {row.feature.split(' ')[0]}
                    </td>
                    {corrData.features.map(f => {
                      const val = row[f];
                      const isHighPos = val >= 0.5;
                      const isHighNeg = val <= -0.5;
                      const isTarget = row.feature === 'Machine failure' || f === 'Machine failure';
                      
                      let cellBg = 'bg-slate-50 text-slate-600';
                      if (val === 1.0) cellBg = 'bg-slate-200 font-bold text-slate-800';
                      else if (isHighPos) cellBg = 'bg-blue-100 text-blue-900 font-bold';
                      else if (isHighNeg) cellBg = 'bg-amber-100 text-amber-900 font-bold';
                      else if (isTarget && Math.abs(val) > 0.15) cellBg = 'bg-rose-100 text-rose-900 font-semibold';

                      return (
                        <td key={f} className={`py-1 px-1 font-mono rounded ${cellBg}`}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Blue: High Positive (+0.50)</span>
            <span>Amber: High Negative (-0.50)</span>
            <span>Rose: Failure Correlated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
