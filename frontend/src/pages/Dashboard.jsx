import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Cpu,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
  Wrench,
  Clock,
  Layers,
  Thermometer,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import MetricCard from '../components/MetricCard';
import RiskBadge from '../components/RiskBadge';
import { api } from '../api';

const COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#ef4444', '#8b5cf6'];
const FAILURE_COLORS = {
  Normal: '#10b981',
  Failure: '#ef4444'
};

export default function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading industrial sensor telemetry & dashboard metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          Failed to load dashboard statistics
        </div>
        <p className="text-sm mt-1">{error || 'Unknown error'}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const ds = stats.dataset_historical;
  const live = stats.live_predictions;
  const health = stats.system_health;

  // Chart data: Normal vs Failures
  const pieData = [
    { name: 'Normal Operational', value: ds.total_records - ds.total_failures, color: '#0d9488' },
    { name: 'Machine Failures', value: ds.total_failures, color: '#ef4444' }
  ];

  // Failure modes data
  const modeData = ds.failure_breakdown.map((m) => ({
    name: m.mode,
    fullName: m.name,
    count: m.count
  }));

  // Machine quality types data
  const typeData = ds.type_distribution.map((t) => ({
    name: `Type ${t.type}`,
    count: t.count,
    pct: t.percentage
  }));

  return (
    <div className="space-y-6">
      {/* Historical vs Live Inferences Notice Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
              Industry 4.0 Telemetry Architecture
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            PredictAI Sensor Monitoring & Predictive Analytics
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Distinguishing <strong>10,000 historical milling records</strong> (AI4I 2020 baseline) from <strong>live simulated inferences</strong>. Powered by calibrated {health.active_model.replace('_', ' ').toUpperCase()} machine learning models.
          </p>
        </div>
        <button
          onClick={() => setActivePage('prediction')}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 shrink-0"
        >
          <Cpu className="w-4 h-4" />
          <span>Run Live Prediction</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Historical Dataset Size"
          value={ds.total_records.toLocaleString()}
          subtitle="ai4i2020.csv milling records"
          icon={Database}
          accent="blue"
          badge="Ground Truth"
        />
        <MetricCard
          title="Historical Failure Rate"
          value={`${ds.failure_rate}%`}
          subtitle={`${ds.total_failures} actual machine failures`}
          icon={ShieldAlert}
          accent="rose"
          badge="Class Imbalance"
        />
        <MetricCard
          title="Live Model Accuracy"
          value={`${(health.accuracy * 100).toFixed(1)}%`}
          subtitle={`F1: ${(health.f1_score * 100).toFixed(1)}% | Recall: ${(health.recall * 100).toFixed(1)}%`}
          icon={TrendingUp}
          accent="teal"
          badge={health.active_model.replace('_', ' ')}
        />
        <MetricCard
          title="Inferred Records Logged"
          value={live.total_inferred.toLocaleString()}
          subtitle={`${live.critical_risk_count} critical & ${live.high_risk_count} high risk`}
          icon={Activity}
          accent="amber"
          badge="SQLite Store"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Imbalance & Machine Failure Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Failure Class Distribution</h3>
              <span className="text-[11px] font-semibold text-slate-500">10,000 Records</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Extreme class imbalance (96.6% normal vs 3.4% failure) addressed via stratified sampling and cost-sensitive weighting.
            </p>
          </div>

          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val.toLocaleString()} records`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-600" />
              <div>
                <div className="font-semibold text-slate-800">9,661 Normal</div>
                <div className="text-[10px] text-slate-400">96.61% safe cycles</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <div>
                <div className="font-semibold text-slate-800">339 Failed</div>
                <div className="text-[10px] text-slate-400">3.39% failures</div>
              </div>
            </div>
          </div>
        </div>

        {/* Failure Modes Frequency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Failure Modes Occurrence</h3>
              <span className="text-[11px] font-semibold text-slate-500">Matzka (2020)</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Distribution across 5 physical failure classes: Heat Dissipation (HDF), Overstrain (OSF), Power (PWF), Tool Wear (TWF), and Random (RNF).
            </p>
          </div>

          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val, name, item) => [`${val} occurrences`, item.payload.fullName]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>HDF (115) & OSF (98) are the most frequent</span>
            <button
              onClick={() => setActivePage('eda')}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Explore EDA &rarr;
            </button>
          </div>
        </div>

        {/* Machine Type Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Machine Quality Variants</h3>
              <span className="text-[11px] font-semibold text-slate-500">Type L, M, H</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Variants reflect component quality tolerances (Low = 60%, Medium = 30%, High = 10%).
            </p>
          </div>

          <div className="space-y-3.5 my-auto py-3">
            {typeData.map((item, idx) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.name} ({item.name.includes('L') ? 'Low Quality' : item.name.includes('M') ? 'Medium Quality' : 'High Quality'})</span>
                  <span>{item.count.toLocaleString()} ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-teal-500' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Type L machines endure higher stress breakdown rates due to lower structural torque thresholds.</span>
          </div>
        </div>
      </div>

      {/* Recent Predictions & Maintenance Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Live Predictions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Live Inferences</h3>
              <p className="text-xs text-slate-500">Live predictions stored in SQLite database</p>
            </div>
            <button
              onClick={() => setActivePage('history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View Full History ({live.total_inferred})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {live.recent_predictions && live.recent_predictions.length > 0 ? (
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Prediction ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Probability</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Tool Wear</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {live.recent_predictions.map((p) => (
                    <tr key={p.prediction_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                        {p.prediction_id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-600">
                        Type {p.machine_type}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        {(p.failure_probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3">
                        <RiskBadge level={p.risk_level} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {p.tool_wear} min
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 truncate max-w-[200px]" title={p.recommended_action}>
                        {p.recommended_action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No live predictions logged yet. Submit a test case on the Failure Prediction page.
            </div>
          )}
        </div>

        {/* Maintenance Tasks & Condition Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Maintenance Work Orders</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                {stats.maintenance_summary.open_tasks} Active
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">TASK-1001: Milling Insert</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Critical</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Tool wear exceeded 210 min. High risk of tool breakage.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">TASK-1002: Spindle Motor Drive</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">High</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Torque spikes detected above 65 Nm at 1400 RPM.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">TASK-1003: Heat Exchanger Cleaning</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Completed</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Thermal gradient restored to 10.5 K.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('maintenance')}
            className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Manage All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
