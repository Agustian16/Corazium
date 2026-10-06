import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLogTransaction } from '../types';
import {
  FileSearch,
  Search,
  Filter,
  Play,
  Pause,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle,
  Copy,
  Clock,
  Layers,
  Sparkles,
  Terminal,
  X,
  Globe,
  Radio,
} from 'lucide-react';

export const LogExplorerView: React.FC = () => {
  const {
    logs,
    selectedLogForModal,
    setSelectedLogForModal,
    isLiveStreaming,
    setIsLiveStreaming,
    createOneClickException,
    addIPToBlacklist,
    setActiveTab,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<'ALL' | 'DENY' | 'ALLOW'>('ALL');
  const [selectedMethod, setSelectedMethod] = useState<'ALL' | 'GET' | 'POST'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');

  // Filter logs based on search criteria (simulating ClickHouse sub-millisecond querying)
  const filteredLogs = logs.filter((log) => {
    if (selectedAction !== 'ALL' && log.action_taken !== selectedAction) return false;
    if (selectedMethod !== 'ALL' && log.http_method !== selectedMethod) return false;
    if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchUri = log.uri.toLowerCase().includes(q);
      const matchIp = log.client_ip.toLowerCase().includes(q);
      const matchHost = log.target_host.toLowerCase().includes(q);
      const matchRule = log.matched_rule_ids.some((r) => String(r).includes(q));
      const matchMsg = log.matched_messages.some((m) => m.toLowerCase().includes(q));
      if (!matchUri && !matchIp && !matchHost && !matchRule && !matchMsg) return false;
    }

    return true;
  });

  // Modal Exception Form
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [exceptionForm, setExceptionForm] = useState({
    rule_id: 942100,
    rule_name: '',
    path_pattern: '',
    parameter_name: '',
    reason: 'Legitimate application request triggered false positive in production.',
  });

  const handleOpenExceptionModal = (log: AuditLogTransaction) => {
    const ruleId = log.matched_rule_ids[0] || 942100;
    const ruleName = log.matched_messages[0] || 'OWASP CRS Rule';
    const pathOnly = log.uri.split('?')[0];
    const param = log.matched_var_name || 'ARGS:username';

    setExceptionForm({
      rule_id: ruleId,
      rule_name: ruleName,
      path_pattern: pathOnly,
      parameter_name: param,
      reason: 'Legitimate request triggered false positive on endpoint parameter.',
    });
    setIsExceptionModalOpen(true);
  };

  const handleConfirmException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLogForModal) return;

    createOneClickException({
      site_id: selectedLogForModal.site_id,
      rule_id: exceptionForm.rule_id,
      rule_name: exceptionForm.rule_name,
      path_pattern: exceptionForm.path_pattern,
      parameter_name: exceptionForm.parameter_name,
      reason: exceptionForm.reason,
    });

    setIsExceptionModalOpen(false);
    setSelectedLogForModal(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to Clipboard', `Copied ${label} to clipboard.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header and Live Streaming Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileSearch className="w-6 h-6 text-cyan-400" />
            ClickHouse Incident Forensic Explorer
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Query millions of high-volume WAF audit transactions in &lt; 500ms with deep HTTP forensics
          </p>
        </div>

        {/* Live Streaming Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
              isLiveStreaming
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            {isLiveStreaming ? <Pause className="w-4 h-4 text-rose-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            <span>Live Stream: {isLiveStreaming ? 'ACTIVE' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Query Filter Toolbar (ClickHouse Fast Query) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by IP, Rule ID (e.g. 942100), URI path, or attack payload..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="DENY">DENY (Blocked)</option>
              <option value="ALLOW">ALLOW (Clean)</option>
            </select>

            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="ALL">All Methods</option>
              <option value="POST">POST</option>
              <option value="GET">GET</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="ALL">All Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </div>
        </div>

        {/* Telemetry info bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <div className="flex items-center gap-2">
            <span>Query Execution: <strong className="text-emerald-400">1.8 ms</strong> (ClickHouse MergeTree)</span>
            <span className="text-slate-600">•</span>
            <span>Matched: <strong className="text-white">{filteredLogs.length}</strong> transactions</span>
          </div>
          <span className="text-cyan-400 hidden sm:inline">Click any row to open Deep Transaction Inspector</span>
        </div>
      </div>

      {/* Forensic Audit Logs Table (FR-3.1) */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-3">TIMESTAMP</th>
                <th className="pb-3">CLIENT IP & ASN</th>
                <th className="pb-3">METHOD</th>
                <th className="pb-3">TARGET URI PATH</th>
                <th className="pb-3">TRIGGERED RULE</th>
                <th className="pb-3">ACTION</th>
                <th className="pb-3">LATENCY</th>
                <th className="pb-3 pr-3 text-right">INSPECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLogForModal(log)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 pl-3 text-slate-400 whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-slate-100">{log.client_ip}</span>
                    <span className="text-[10px] text-slate-400 block font-sans truncate max-w-[160px]">
                      {log.client_country} ({log.client_country_code}) • {log.client_asn.split(' ')[0]}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.http_method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {log.http_method}
                    </span>
                  </td>
                  <td className="py-3 text-slate-200 max-w-xs truncate" title={log.uri}>
                    {log.uri}
                  </td>
                  <td className="py-3">
                    {log.matched_rule_ids.length > 0 ? (
                      <div>
                        <span className="font-bold text-rose-400">#{log.matched_rule_ids[0]}</span>
                        <span className="text-[10px] text-slate-400 block font-sans truncate max-w-[180px]">
                          {log.matched_messages[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-sans">None (Clean)</span>
                    )}
                  </td>
                  <td className="py-3">
                    {log.action_taken === 'DENY' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        DENY (403)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ALLOW (200)
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-slate-300 text-[11px]">
                    {(log.latency_us / 1000).toFixed(2)} ms
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLogForModal(log);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors font-sans"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Inspector Modal (FR-3.2 & FR-3.3) */}
      {selectedLogForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">Transaction Forensic Inspector</span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/20 text-cyan-300">
                    {selectedLogForModal.transaction_id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Enforcer Node: {selectedLogForModal.node_name} • Host: {selectedLogForModal.target_host}
                </p>
              </div>
              <button
                onClick={() => setSelectedLogForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attack Summary Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span className="font-bold text-sm text-slate-100">
                    {selectedLogForModal.action_taken === 'DENY'
                      ? 'Attack Blocked by OWASP Coraza'
                      : 'Legitimate Request Permitted'}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  HTTP Status: <strong className="text-white">{selectedLogForModal.response_status}</strong>
                </span>
              </div>

              {selectedLogForModal.matched_rule_ids.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Triggered Rule</span>
                    <div className="font-mono text-cyan-300 font-semibold mt-0.5">
                      Rule #{selectedLogForModal.matched_rule_ids[0]}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {selectedLogForModal.matched_messages[0]}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Matched Variable & Data</span>
                    <div className="font-mono text-rose-300 font-semibold mt-0.5 truncate">
                      {selectedLogForModal.matched_var_name}
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 mt-0.5">
                      {selectedLogForModal.matched_data[0] || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Client IP & Geographic Info */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200 font-mono">{selectedLogForModal.client_ip}</div>
                  <div className="text-[11px] text-slate-400">
                    {selectedLogForModal.client_country} ({selectedLogForModal.client_country_code}) • {selectedLogForModal.client_asn}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addIPToBlacklist(selectedLogForModal.client_ip, `Blocked from incident inspector for ${selectedLogForModal.uri}`)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/50 transition-colors flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Add IP to Blacklist
                </button>
              </div>
            </div>

            {/* Request Headers (with NFR-2.3 privacy masking) */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span>HTTP Request Headers (NFR-2.3 Privacy Masking Applied)</span>
                <button
                  onClick={() => handleCopy(JSON.stringify(selectedLogForModal.request_headers, null, 2), 'Headers')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300/90 font-mono text-[11px] overflow-x-auto max-h-36">
                {JSON.stringify(selectedLogForModal.request_headers, null, 2)}
              </pre>
            </div>

            {/* Request Body Payload */}
            {selectedLogForModal.request_body && (
              <div className="space-y-1.5 text-xs">
                <span className="block text-slate-300 font-medium">HTTP Request Body Payload</span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-rose-300/90 font-mono text-[11px] overflow-x-auto max-h-28">
                  {selectedLogForModal.request_body}
                </pre>
              </div>
            )}

            {/* Modal Bottom Actions (One-Click Exception PRD FR-3.3) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-[11px] text-slate-400">
                MTTR Target: <strong className="text-emerald-400">&lt; 2 minutes</strong> via One-Click Exception
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLogForModal(null)}
                  className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Close
                </button>

                {selectedLogForModal.matched_rule_ids.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenExceptionModal(selectedLogForModal)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    <span>Create Exception / Suppress Rule</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* One-Click Exception Creation Dialog (PRD FR-3.3) */}
      {isExceptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <form
            onSubmit={handleConfirmException}
            className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  One-Click False Positive Suppression
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesize SecLang exception rule automatically without editing raw config files
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExceptionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 font-mono text-[11px] text-cyan-300 space-y-1">
                <div className="font-semibold text-white">Synthesized SecLang Directive:</div>
                <div className="text-emerald-300 font-bold">
                  {exceptionForm.parameter_name
                    ? `SecRuleUpdateTargetById ${exceptionForm.rule_id} "!${exceptionForm.parameter_name}"`
                    : `ctl:ruleRemoveById=${exceptionForm.rule_id}`}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Endpoint Path</label>
                <input
                  type="text"
                  required
                  value={exceptionForm.path_pattern}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, path_pattern: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Parameter / Variable to Ignore</label>
                <input
                  type="text"
                  value={exceptionForm.parameter_name}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, parameter_name: e.target.value })}
                  placeholder="e.g. ARGS:username or leave empty to suppress rule on path"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tuning Rationale / Justification</label>
                <textarea
                  rows={2}
                  required
                  value={exceptionForm.reason}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsExceptionModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
              >
                Deploy Exception Instantly
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
