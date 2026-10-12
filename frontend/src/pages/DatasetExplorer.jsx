import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../api';

export default function DatasetExplorer() {
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [machineType, setMachineType] = useState('');
  const [failureOnly, setFailureOnly] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadTableData();
  }, [page, pageSize, machineType, failureOnly]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getDatasetSummary();
      setSummary(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async () => {
    try {
      setTableLoading(true);
      const params = {
        page,
        page_size: pageSize,
        search,
        ...(machineType && { machine_type: machineType }),
        ...(failureOnly && { failure_only: true })
      };
      const res = await api.getDatasetPreview(params);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadTableData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading AI4I 2020 dataset explorer...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
        Failed to load dataset: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview & Download Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
              AI4I 2020 Predictive Maintenance Dataset
            </span>
            <span className="text-xs text-slate-400">UCI Machine Learning Repository</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Milling Machine Telemetry Dataset Explorer
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            10,000 synthetic instances reflecting real manufacturing plant condition monitoring with 14 features and 5 validated physical failure mechanisms.
          </p>
        </div>

        <a
          href={api.getDatasetDownloadUrl()}
          download="predictai_ai4i2020_cleaned.csv"
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Cleaned Dataset (CSV)</span>
        </a>
      </div>

      {/* Dataset Health & Verification Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Rows</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{summary.total_records.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 0 Missing Values
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Features Analyzed</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{summary.total_features} Columns</div>
          <div className="text-[10px] text-slate-400 mt-1">6 Sensor + 3 Engineered</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Failure Class Count</div>
          <div className="text-xl font-bold text-rose-600 mt-1">{summary.total_failures} / 10,000</div>
          <div className="text-[10px] text-rose-500 font-semibold mt-1">3.39% Observed Rate</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Data Leakage Prevention</div>
          <div className="text-xl font-bold text-teal-700 mt-1">Enforced</div>
          <div className="text-[10px] text-teal-600 mt-1">Identifiers & Modes Excluded</div>
        </div>
      </div>

      {/* Schema / Columns Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Column Data Types & Information Schema
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Column Name</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Missing</th>
                <th className="py-2.5 px-3">Unique Values</th>
                <th className="py-2.5 px-3">Sample Value</th>
                <th className="py-2.5 px-3">Role in System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.columns_info.map((col) => (
                <tr key={col.name} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 font-mono text-[11px]">{col.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{col.dtype}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-medium">0 (0.0%)</td>
                  <td className="py-2.5 px-3">{col.unique_count.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{col.sample}</td>
                  <td className="py-2.5 px-3">
                    {col.name === 'Machine failure' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Target Label</span>
                    ) : ['UDI', 'Product ID'].includes(col.name) ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Excluded (ID)</span>
                    ) : ['TWF', 'HDF', 'PWF', 'OSF', 'RNF'].includes(col.name) ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Sub-Failure Mode</span>
                    ) : ['Temp_difference', 'Power_W', 'Tool_overstrain'].includes(col.name) ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Engineered Feature</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Predictor Input</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Data Table with Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search Product ID (e.g. M14860) or UDI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              Filter
            </button>
          </form>

          <div className="flex items-center gap-3">
            {/* Machine Type Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Variant:</span>
              <select
                value={machineType}
                onChange={(e) => {
                  setMachineType(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none bg-slate-50"
              >
                <option value="">All Types (L, M, H)</option>
                <option value="L">Type L (Low)</option>
                <option value="M">Type M (Med)</option>
                <option value="H">Type H (High)</option>
              </select>
            </div>

            {/* Failure Only Checkbox */}
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={failureOnly}
                onChange={(e) => {
                  setFailureOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded accent-blue-600"
              />
              <span>Failures Only (339)</span>
            </label>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">UDI</th>
                <th className="py-2 px-3">Product ID</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Air Temp (K)</th>
                <th className="py-2 px-3">Process Temp (K)</th>
                <th className="py-2 px-3">Speed (RPM)</th>
                <th className="py-2 px-3">Torque (Nm)</th>
                <th className="py-2 px-3">Tool Wear (min)</th>
                <th className="py-2 px-3">ΔT (K)</th>
                <th className="py-2 px-3">Failure</th>
                <th className="py-2 px-3">Failure Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableLoading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-600" />
                    Fetching page records...
                  </td>
                </tr>
              ) : data && data.records.length > 0 ? (
                data.records.map((r) => {
                  const failureLabel = r.twf ? 'TWF' : r.hdf ? 'HDF' : r.pwf ? 'PWF' : r.osf ? 'OSF' : r.rnf ? 'RNF' : '-';
                  return (
                    <tr key={r.udi} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-slate-500">{r.udi}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-800">{r.product_id}</td>
                      <td className="py-2 px-3 font-semibold">Type {r.type}</td>
                      <td className="py-2 px-3">{r.air_temp}</td>
                      <td className="py-2 px-3">{r.process_temp}</td>
                      <td className="py-2 px-3">{r.rot_speed}</td>
                      <td className="py-2 px-3">{r.torque}</td>
                      <td className="py-2 px-3">{r.tool_wear}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{r.temp_diff}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.machine_failure === 1 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {r.machine_failure === 1 ? 'Failed' : 'Normal'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-700">{failureLabel}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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
    </div>
  );
}
