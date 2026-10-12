import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Filter,
  ShieldAlert,
  Calendar,
  User,
  Info
} from 'lucide-react';
import Modal from '../components/Modal';
import { api } from '../api';

export default function Maintenance() {
  const [tasks, setTasks] = useState([]);
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    machine_id: 'CNC-042',
    title: '',
    failure_mode: 'Tool Wear Failure (TWF)',
    priority: 'High',
    status: 'Pending',
    assigned_to: 'Alex Mercer',
    notes: '',
    due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tList, rList] = await Promise.all([
        api.getMaintenanceTasks(),
        api.getMaintenanceRecommendations()
      ]);
      setTasks(tList);
      setRecs(rList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setTaskForm({
      machine_id: 'CNC-042',
      title: '',
      failure_mode: 'Tool Wear Failure (TWF)',
      priority: 'High',
      status: 'Pending',
      assigned_to: 'Alex Mercer',
      notes: '',
      due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      machine_id: task.machine_id,
      title: task.title,
      failure_mode: task.failure_mode || 'General',
      priority: task.priority,
      status: task.status,
      assigned_to: task.assigned_to || '',
      notes: task.notes || '',
      due_date: task.due_date || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.updateMaintenanceTask(editingTask.task_id, taskForm);
      } else {
        await api.createMaintenanceTask(taskForm);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(`Error saving task: ${err.message}`);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : task.status === 'Pending' ? 'In Progress' : 'Completed';
    try {
      await api.updateMaintenanceTask(task.task_id, { status: nextStatus });
      loadData();
    } catch (err) {
      alert(`Error updating task status: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm(`Delete maintenance task ${taskId}?`)) return;
    try {
      await api.deleteMaintenanceTask(taskId);
      loadData();
    } catch (err) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading maintenance work orders and condition guidelines...</p>
      </div>
    );
  }

  const filteredTasks = tasks.filter(t => statusFilter === 'All' || t.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
              Plant Maintenance Operations
            </span>
            <span className="text-xs text-slate-400">Condition-Based Work Orders</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Predictive Maintenance Tasks & SOP Guidelines
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Turn statistical machine failure warnings into scheduled work orders. Track technician assignments and completion statuses in SQLite.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Condition-Based Subsystem Guidelines */}
      {recs && recs.standard_guidelines && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                Condition-Based Maintenance Protocols (Standard Operating Procedures)
              </h3>
              <p className="text-xs text-slate-500">Physics-informed threshold rules based on Matzka (2020)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recs.standard_guidelines.map((g, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-900">{g.subsystem}</div>
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Trigger:</span> {g.trigger_condition}
                </div>
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Interval:</span> {g.interval}
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700 font-medium">
                  {g.prescribed_action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Tasks Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Maintenance Tasks & Work Orders</h3>
            <p className="text-xs text-slate-500">Manage pending, active, and completed interventions</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
            {['All', 'Pending', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Task ID</th>
                <th className="py-2.5 px-3">Machine ID</th>
                <th className="py-2.5 px-3">Title & Notes</th>
                <th className="py-2.5 px-3">Failure Mode</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Assigned To</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t) => (
                  <tr key={t.task_id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleToggleStatus(t)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          t.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : t.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Click to advance status"
                      >
                        {t.status}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{t.task_id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{t.machine_id}</td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-semibold text-slate-800">{t.title}</div>
                      {t.notes && <div className="text-[11px] text-slate-500 truncate">{t.notes}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{t.failure_mode}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : t.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{t.assigned_to || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{t.due_date || '-'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(t.task_id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No tasks match selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating / Editing Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? `Edit Work Order ${editingTask.task_id}` : 'Create Maintenance Work Order'}
      >
        <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Machine / Asset ID</label>
              <input
                type="text"
                required
                value={taskForm.machine_id}
                onChange={(e) => setTaskForm({ ...taskForm, machine_id: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Failure Subsystem / Mode</label>
              <select
                value={taskForm.failure_mode}
                onChange={(e) => setTaskForm({ ...taskForm, failure_mode: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="Tool Wear Failure (TWF)">Tool Wear Failure (TWF)</option>
                <option value="Heat Dissipation Failure (HDF)">Heat Dissipation Failure (HDF)</option>
                <option value="Power Failure (PWF)">Power Failure (PWF)</option>
                <option value="Overstrain Failure (OSF)">Overstrain Failure (OSF)</option>
                <option value="General Inspection">General Inspection</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Work Order Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Replace worn cutter insert and inspect coolant nozzles"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700">Due Date</label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Assigned Technician</label>
            <input
              type="text"
              value={taskForm.assigned_to}
              onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Maintenance Notes / Technical Findings</label>
            <textarea
              rows={3}
              placeholder="Record sensor observations, torque limits, or part numbers replaced..."
              value={taskForm.notes}
              onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
            >
              Save Work Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Simulated Hardware Disclosure */}
      <div className="p-4 bg-slate-100 rounded-xl text-slate-500 text-xs flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          <strong>Operational Notice:</strong> Maintenance work orders and telemetry logs shown are software-simulated records for plant condition demonstration; no physical industrial IoT sensors or live machinery are directly controlled.
        </span>
      </div>
    </div>
  );
}
