import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ShieldCheck,
  Code2,
  Check,
  X,
  TrendingDown,
} from 'lucide-react';

export const ExceptionsView: React.FC = () => {
  const { exceptions, deleteException, createOneClickException, sites } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    site_id: 'site-api',
    rule_id: 942100,
    rule_name: 'SQL Injection Attack Detected via libinjection',
    path_pattern: '/api/v1/search',
    parameter_name: 'ARGS:query',
    reason: 'Legitimate search queries with mathematical characters triggering false positives',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createOneClickException(form);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CheckCircle className="w-6 h-6 text-amber-400" />
            False Positive Tuning & Rule Exceptions
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Targeted parameter suppressions and endpoint exclusions to eliminate false positives without lowering global security
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>New Endpoint Exception</span>
        </button>
      </div>

      {/* KPI Cards: MTTR reduction */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">MTTR (False Positive Resolution)</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <span>1.2 min</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Baseline: 45 min</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              97% FASTER
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Suppression Directives</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {exceptions.length} Rules
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
            ENFORCED
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Engine Deployment Method</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              gRPC Stream
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            ZERO RESTART
          </span>
        </div>
      </div>

      {/* Exceptions List Table */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Active Rule Exceptions (PostgreSQL Schema)</h2>
            <p className="text-xs text-slate-400">Scoped rule exclusions compiled into Coraza memory</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-3">RULE ID & TARGET</th>
                <th className="pb-3">VHOST / SITE</th>
                <th className="pb-3">PATH PATTERN</th>
                <th className="pb-3">GENERATED SECLANG DIRECTIVE</th>
                <th className="pb-3">JUSTIFICATION / REASON</th>
                <th className="pb-3">AUTHOR</th>
                <th className="pb-3 pr-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {exceptions.map((exc) => (
                <tr key={exc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-3">
                    <span className="font-bold text-amber-400">#{exc.rule_id}</span>
                    <span className="text-[10px] text-slate-400 block font-sans truncate max-w-[160px]">
                      {exc.rule_name}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-300 font-sans">{exc.site_domain}</td>
                  <td className="py-3.5 text-cyan-300 font-mono">{exc.path_pattern}</td>
                  <td className="py-3.5">
                    <code className="px-2 py-1 rounded bg-slate-950 text-emerald-300 border border-slate-800 text-[11px] block truncate max-w-xs font-mono">
                      {exc.generated_directive}
                    </code>
                  </td>
                  <td className="py-3.5 text-slate-400 font-sans max-w-xs truncate" title={exc.reason}>
                    {exc.reason}
                  </td>
                  <td className="py-3.5 text-slate-400 font-sans text-[11px]">{exc.created_by}</td>
                  <td className="py-3.5 pr-3 text-right">
                    <button
                      onClick={() => deleteException(exc.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Revoke Exception"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Exception Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <form
            onSubmit={handleCreate}
            className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  Create Rule Exception
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Suppress specific rule evaluation for a designated endpoint
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Virtual Host</label>
                <select
                  value={form.site_id}
                  onChange={(e) => setForm({ ...form, site_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.domain_name} ({s.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Rule ID to Suppress</label>
                  <input
                    type="number"
                    required
                    value={form.rule_id}
                    onChange={(e) => setForm({ ...form, rule_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Parameter to Ignore</label>
                  <input
                    type="text"
                    value={form.parameter_name}
                    onChange={(e) => setForm({ ...form, parameter_name: e.target.value })}
                    placeholder="e.g. ARGS:q"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Path Pattern</label>
                <input
                  type="text"
                  required
                  value={form.path_pattern}
                  onChange={(e) => setForm({ ...form, path_pattern: e.target.value })}
                  placeholder="/api/v1/search"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Justification Reason</label>
                <textarea
                  rows={2}
                  required
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
              >
                Deploy Exception
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
