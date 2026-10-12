import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Clock
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import Modal from '../components/Modal';
import { api } from '../api';

export default function History() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Selected item modal
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [page, pageSize, riskFilter, typeFilter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        search,
        ...(riskFilter && { risk_level: riskFilter }),
        ...(typeFilter && { machine_type: typeFilter })
      };
      const res = await api.getPredictionHistory(params);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  const handleDeleteItem = async (predId) => {
    if (!window.confirm(`Delete record ${predId}?`)) return;
    try {
      await api.deletePrediction(predId);
      loadHistory();
    } catch (err) {
      alert(`Error deleting record: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all prediction history?')) return;
    try {
      await api.clearHistory();
      loadHistory();
    } catch (err) {
      alert(`Error clearing history: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
              Audit & Inferences Store
            </span>
            <span className="text-xs text-slate-400">SQLite Logged Telemetry</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Machine Failure Prediction Audit Trail
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Full historical archive of single and batch model inferences, probability scores, risk categories, and prescribed maintenance recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={api.getExportHistoryUrl()}
            download="predictai_history_export.csv"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={handleClearAll}
            className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-slate-200"
            title="Clear All History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search Prediction ID or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3">
            {/* Risk filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Risk:</span>
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none bg-slate-50"
              >
                <option value="">All Risk Levels</option>
                <option value="Low Risk">Low Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="High Risk">High Risk</option>
                <option value="Critical Risk">Critical Risk</option>
              </select>
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none bg-slate-50"
              >
                <option value="">All Types</option>
                <option value="L">Type L</option>
                <option value="M">Type M</option>
                <option value="H">Type H</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Prediction ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Sensor Values (Speed / Torque / Wear)</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3">Probability</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-600" />
                    Loading prediction records...
                  </td>
                </tr>
              ) : data && data.items.length > 0 ? (
                data.items.map((item) => (
                  <tr key={item.prediction_id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{item.prediction_id}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{item.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold">Type {item.machine_type}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {item.rotational_speed} RPM | {item.torque} Nm | {item.tool_wear} min
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.prediction === 1 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.prediction === 1 ? 'Failure' : 'Normal'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold">
                      {(item.failure_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <RiskBadge level={item.risk_level} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {item.model_used.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.prediction_id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No predictions recorded yet. Run a single or batch prediction to see records here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <div>
              Showing {data.total > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, data.total)} of {data.total.toLocaleString()} records
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {page} of {data.total_pages}
              </span>
              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem ? `Inspection Detail: ${selectedItem.prediction_id}` : ''}
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Timestamp</span>
                <div className="font-mono font-semibold text-slate-800">{selectedItem.timestamp}</div>
              </div>
              <RiskBadge level={selectedItem.risk_level} size="lg" />
            </div>

            {/* Parameter grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Machine Type</span>
                <div className="font-bold text-slate-800">Type {selectedItem.machine_type}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Air Temperature</span>
                <div className="font-bold text-slate-800">{selectedItem.air_temperature} K</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Process Temp</span>
                <div className="font-bold text-slate-800">{selectedItem.process_temperature} K</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Rotational Speed</span>
                <div className="font-bold text-slate-800">{selectedItem.rotational_speed} RPM</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Torque</span>
                <div className="font-bold text-slate-800">{selectedItem.torque} Nm</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Tool Wear</span>
                <div className="font-bold text-slate-800">{selectedItem.tool_wear} min</div>
              </div>
            </div>

            {/* Model & Probability */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-700 uppercase font-bold">Estimated Probability</span>
                <div className="text-lg font-bold text-blue-950 font-mono">
                  {(selectedItem.failure_probability * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-700 uppercase font-bold">Inference Engine</span>
                <div className="font-semibold text-slate-800">{selectedItem.model_used}</div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Recommended Action:</span>
              <p className="text-slate-600 leading-relaxed">{selectedItem.recommended_action}</p>
            </div>

            {/* Notes */}
            {selectedItem.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Technician Notes:</span>
                <p className="text-slate-600 italic">{selectedItem.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
