import React, { useState } from 'react';
import {
  Cpu,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  Upload,
  FileSpreadsheet,
  Download,
  Info,
  RefreshCw,
  Sparkles,
  Zap,
  Flame,
  Gauge
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { api } from '../api';

const PRESETS = [
  {
    name: 'Normal Safe Operation',
    type: 'M',
    air_temp: 298.2,
    process_temp: 308.5,
    rot_speed: 1520,
    torque: 39.5,
    tool_wear: 45,
    note: 'Optimal standard operating parameters'
  },
  {
    name: 'Tool Wear Hazard (TWF)',
    type: 'L',
    air_temp: 298.5,
    process_temp: 308.2,
    rot_speed: 1510,
    torque: 44.0,
    tool_wear: 228,
    note: 'Extreme wear accumulated on cutting insert'
  },
  {
    name: 'Heat Dissipation Hazard (HDF)',
    type: 'L',
    air_temp: 302.8,
    process_temp: 310.5,
    rot_speed: 1340,
    torque: 48.0,
    tool_wear: 75,
    note: 'Delta T < 8.6 K at low convective speed < 1380 RPM'
  },
  {
    name: 'Power Overload Hazard (PWF)',
    type: 'M',
    air_temp: 299.1,
    process_temp: 309.2,
    rot_speed: 2650,
    torque: 66.0,
    tool_wear: 60,
    note: 'High torque at high RPM exceeds 9,000 Watts'
  },
  {
    name: 'Overstrain Hazard (OSF)',
    type: 'L',
    air_temp: 298.0,
    process_temp: 308.0,
    rot_speed: 1450,
    torque: 64.0,
    tool_wear: 205,
    note: 'Torque * Tool Wear exceeds 11,000 min*Nm for Type L'
  }
];

export default function Prediction({ activeModel, setActivePage }) {
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'batch'

  // Single form state
  const [form, setForm] = useState({
    machine_type: 'M',
    air_temperature: 298.5,
    process_temperature: 308.8,
    rotational_speed: 1500,
    torque: 42.0,
    tool_wear: 65,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Batch state
  const [batchFile, setBatchFile] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [batchError, setBatchError] = useState(null);

  const handleApplyPreset = (p) => {
    setForm({
      machine_type: p.type,
      air_temperature: p.air_temp,
      process_temperature: p.process_temp,
      rotational_speed: p.rot_speed,
      torque: p.torque,
      tool_wear: p.tool_wear,
      notes: `Preset: ${p.name} - ${p.note}`
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        machine_type: form.machine_type,
        air_temperature: parseFloat(form.air_temperature),
        process_temperature: parseFloat(form.process_temperature),
        rotational_speed: parseFloat(form.rotational_speed),
        torque: parseFloat(form.torque),
        tool_wear: parseFloat(form.tool_wear),
        model_name: activeModel,
        notes: form.notes
      };
      const res = await api.predictFailure(payload);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchFile) return;
    setBatchLoading(true);
    setBatchError(null);
    try {
      const res = await api.predictBatch(batchFile);
      setBatchResult(res);
    } catch (err) {
      setBatchError(err.message);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleCreateTaskFromPrediction = async () => {
    if (!result) return;
    try {
      await api.createMaintenanceTask({
        machine_id: `ASSET-${result.machine_type}-${result.prediction_id.slice(-4)}`,
        title: `Maintenance inspection for ${result.prediction_id}`,
        failure_mode: result.failure_modes.find(m => m.risk_level === 'High')?.mode || 'General',
        priority: result.risk_level === 'Critical Risk' ? 'Critical' : result.risk_level === 'High Risk' ? 'High' : 'Medium',
        status: 'Pending',
        notes: `Auto-generated from prediction: ${result.recommended_action}`
      });
      alert('Maintenance task successfully created!');
      if (setActivePage) setActivePage('maintenance');
    } catch (err) {
      alert(`Error creating task: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Single Machine Inference
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'batch'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Batch CSV Ingestion</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          Active Engine: <strong className="text-slate-800">{activeModel.replace('_', ' ').toUpperCase()}</strong>
        </div>
      </div>

      {activeTab === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form & Presets Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Presets Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Load Verified Test Presets
                </span>
                <span className="text-[11px] text-slate-400">Click to autofill parameters</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 text-[11px] font-medium text-slate-700 transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  Machine Sensor Parameters
                </h3>
                <span className="text-xs text-slate-400">All fields required</span>
              </div>

              {/* Machine Quality Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Machine Quality Variant (Type)</span>
                  <span className="text-slate-400 font-normal">L: Low (60%), M: Med (30%), H: High (10%)</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['L', 'M', 'H'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, machine_type: t })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        form.machine_type === t
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      Type {t} {t === 'L' ? '(Standard)' : t === 'M' ? '(Reinforced)' : '(Heavy Duty)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Air Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Air Temperature [K]</span>
                  <span className="font-mono text-blue-600 font-semibold">{form.air_temperature} K ({(form.air_temperature - 273.15).toFixed(1)} °C)</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="295"
                    max="305"
                    step="0.1"
                    value={form.air_temperature}
                    onChange={(e) => setForm({ ...form, air_temperature: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={form.air_temperature}
                    onChange={(e) => setForm({ ...form, air_temperature: parseFloat(e.target.value) })}
                    className="w-20 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-right font-mono"
                  />
                </div>
                <div className="text-[10px] text-slate-400">Dataset normal range: 295.3 K – 304.5 K</div>
              </div>

              {/* Process Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Process Temperature [K]</span>
                  <span className="font-mono text-blue-600 font-semibold">{form.process_temperature} K ({(form.process_temperature - 273.15).toFixed(1)} °C)</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="305"
                    max="315"
                    step="0.1"
                    value={form.process_temperature}
                    onChange={(e) => setForm({ ...form, process_temperature: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={form.process_temperature}
                    onChange={(e) => setForm({ ...form, process_temperature: parseFloat(e.target.value) })}
                    className="w-20 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-right font-mono"
                  />
                </div>
                <div className="text-[10px] text-slate-400">
                  Calculated ΔT: <strong>{(form.process_temperature - form.air_temperature).toFixed(2)} K</strong> (Hazard &lt; 8.6 K)
                </div>
              </div>

              {/* Rotational Speed */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Rotational Speed [RPM]</span>
                  <span className="font-mono text-blue-600 font-semibold">{form.rotational_speed} RPM</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1100"
                    max="2900"
                    step="10"
                    value={form.rotational_speed}
                    onChange={(e) => setForm({ ...form, rotational_speed: parseInt(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    step="1"
                    value={form.rotational_speed}
                    onChange={(e) => setForm({ ...form, rotational_speed: parseInt(e.target.value) })}
                    className="w-20 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-right font-mono"
                  />
                </div>
                <div className="text-[10px] text-slate-400">Dataset normal range: 1,168 – 2,886 RPM</div>
              </div>

              {/* Torque */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Torque [Nm]</span>
                  <span className="font-mono text-blue-600 font-semibold">{form.torque} Nm</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3"
                    max="80"
                    step="0.5"
                    value={form.torque}
                    onChange={(e) => setForm({ ...form, torque: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={form.torque}
                    onChange={(e) => setForm({ ...form, torque: parseFloat(e.target.value) })}
                    className="w-20 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-right font-mono"
                  />
                </div>
                <div className="text-[10px] text-slate-400">
                  Effective Power: <strong>{(form.rotational_speed * (2 * Math.PI / 60) * form.torque).toFixed(0)} Watts</strong> (Safe: 3,500 – 9,000 W)
                </div>
              </div>

              {/* Tool Wear */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Tool Wear Duration [min]</span>
                  <span className="font-mono text-blue-600 font-semibold">{form.tool_wear} min</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="260"
                    step="1"
                    value={form.tool_wear}
                    onChange={(e) => setForm({ ...form, tool_wear: parseInt(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    step="1"
                    value={form.tool_wear}
                    onChange={(e) => setForm({ ...form, tool_wear: parseInt(e.target.value) })}
                    className="w-20 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-right font-mono"
                  />
                </div>
                <div className="text-[10px] text-slate-400">
                  Critical fatigue threshold: <strong>200 – 240 minutes</strong>
                </div>
              </div>

              {/* Technician Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Technician Notes / Machine Tag</label>
                <input
                  type="text"
                  placeholder="e.g. CNC Machine #4 Line B - Morning shift observation"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Machine Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Run Failure Prediction & Diagnostics</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 animate-in fade-in duration-200">
                {/* Result Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prediction Outcome</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {result.prediction === 1 ? 'Failure Likely Detected' : 'Normal Machine Condition'}
                    </h3>
                  </div>
                  <RiskBadge level={result.risk_level} size="lg" />
                </div>

                {/* Probability Meter */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Estimated Failure Probability:</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {(result.failure_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.failure_probability >= 0.70
                          ? 'bg-rose-500'
                          : result.failure_probability >= 0.35
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, result.failure_probability * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Safe (&lt;15%)</span>
                    <span>Warning (35%)</span>
                    <span>Critical (&gt;70%)</span>
                  </div>
                </div>

                {/* Physical Failure Modes Assessment */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800">Physical Failure Modes Assessment:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {result.failure_modes.map((fm) => (
                      <div
                        key={fm.mode}
                        className={`p-2.5 rounded-xl border text-xs ${
                          fm.risk_level === 'High'
                            ? 'bg-rose-50/80 border-rose-200 text-rose-900 font-semibold'
                            : fm.risk_level === 'Medium'
                            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{fm.mode}</span>
                          <span className="text-[10px] uppercase font-bold">{fm.risk_level}</span>
                        </div>
                        <div className="text-[10px] mt-0.5 truncate">{fm.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contributing Sensor Factors */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800">Key Sensor Influences:</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {result.contributing_factors.slice(0, 4).map((f) => (
                      <div key={f.feature} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-800">{f.label}</div>
                          <div className="text-[11px] text-slate-500">{f.description}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          f.status === 'Critical' ? 'bg-rose-100 text-rose-700' : f.status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    <span>Prescribed Maintenance Action:</span>
                  </div>
                  <p className="text-xs text-blue-950 font-medium leading-relaxed">
                    {result.recommended_action}
                  </p>
                </div>

                {/* Actions: Create Task */}
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={handleCreateTaskFromPrediction}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Create Work Order</span>
                  </button>
                  <button
                    onClick={() => setActivePage('explainability')}
                    className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Explain AI &rarr;
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="text-[10px] text-slate-400 italic">
                  {result.disclaimer}
                </p>
              </div>
            ) : (
              <div className="h-full min-h-[350px] bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400 mb-3">
                  <Cpu className="w-8 h-8 text-blue-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Awaiting Machine Telemetry</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Fill in the operating parameters on the left or click a preset scenario to compute instant failure predictions and risk diagnostics.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch Prediction Panel */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Batch Industrial CSV Ingestion
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload machine log files in CSV format to classify multiple machines simultaneously. Automatically applies {activeModel.replace('_', ' ')} pipeline and writes records into database.
            </p>
          </div>

          {/* Upload Box */}
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 transition-colors bg-slate-50 flex flex-col items-center justify-center text-center">
              <Upload className="w-8 h-8 text-blue-600 mb-2" />
              <label className="cursor-pointer">
                <span className="text-xs font-bold text-blue-600 hover:underline">Choose CSV File</span>
                <span className="text-xs text-slate-500"> or drag and drop here</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setBatchFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-1">
                Required columns: Type, Air temperature [K], Process temperature [K], Rotational speed [rpm], Torque [Nm], Tool wear [min]
              </p>
              {batchFile && (
                <div className="mt-3 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-2">
                  <span>Selected: {batchFile.name} ({(batchFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <a
                href={api.getDatasetDownloadUrl()}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                download
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample AI4I Cleaned CSV</span>
              </a>

              <button
                type="submit"
                disabled={!batchFile || batchLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
              >
                {batchLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Inferences...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Process Batch CSV</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {batchError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {batchError}
            </div>
          )}

          {batchResult && (
            <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in">
              {/* Batch KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Rows</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{batchResult.total_processed}</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-[10px] text-emerald-600 font-semibold uppercase">Normal Machines</div>
                  <div className="text-xl font-bold text-emerald-800 mt-1">{batchResult.normal_count}</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="text-[10px] text-rose-600 font-semibold uppercase">Failures Flagged</div>
                  <div className="text-xl font-bold text-rose-800 mt-1">{batchResult.failure_count}</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-[10px] text-amber-600 font-semibold uppercase">Critical Alerts</div>
                  <div className="text-xl font-bold text-amber-800 mt-1">{batchResult.critical_risk_count}</div>
                </div>
              </div>

              {/* Batch Table */}
              <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Row</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Air / Proc Temp</th>
                      <th className="py-2 px-3">Speed</th>
                      <th className="py-2 px-3">Torque</th>
                      <th className="py-2 px-3">Wear</th>
                      <th className="py-2 px-3">Prediction</th>
                      <th className="py-2 px-3">Probability</th>
                      <th className="py-2 px-3">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchResult.predictions.slice(0, 100).map((p) => (
                      <tr key={p.row_index} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-mono font-medium">{p.row_index}</td>
                        <td className="py-2 px-3 font-semibold">Type {p.machine_type}</td>
                        <td className="py-2 px-3 text-slate-600">{p.air_temperature} / {p.process_temperature} K</td>
                        <td className="py-2 px-3">{p.rotational_speed} RPM</td>
                        <td className="py-2 px-3">{p.torque} Nm</td>
                        <td className="py-2 px-3">{p.tool_wear} min</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.prediction === 1 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.prediction === 1 ? 'Failure' : 'Normal'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-semibold">{(p.failure_probability * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3"><RiskBadge level={p.risk_level} size="sm" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
