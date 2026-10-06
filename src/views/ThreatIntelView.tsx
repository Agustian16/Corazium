import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Ban,
  ShieldCheck,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Globe,
  Radio,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';

export const ThreatIntelView: React.FC = () => {
  const { ipEntries, addIPToBlacklist, removeIPEntry, threatFeeds, syncThreatFeedNow, sites } = useApp();

  const [activeTab, setActiveTab] = useState<'blocklist' | 'allowlist' | 'feeds'>('blocklist');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ip_cidr: '198.51.100.0/24',
    type: 'BLOCKLIST' as 'BLOCKLIST' | 'ALLOWLIST',
    scope: 'GLOBAL',
    reason: 'Suspicious vulnerability scanning subnet detected by SIEM',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIPToBlacklist(formData.ip_cidr, formData.reason, formData.scope);
    setIsAddModalOpen(false);
  };

  const blocklist = ipEntries.filter((e) => e.type === 'BLOCKLIST');
  const allowlist = ipEntries.filter((e) => e.type === 'ALLOWLIST');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Ban className="w-6 h-6 text-rose-400" />
            Threat Intelligence & IP Reputation
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Global CIDR blocklists, automated threat feed ingestion, and trusted infrastructure allowlists
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold transition-all shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add IP / CIDR Rule</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('blocklist')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'blocklist'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Ban className="w-4 h-4" />
          <span>Active Blocklist ({blocklist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('allowlist')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'allowlist'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Trusted Allowlist ({allowlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feeds')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'feeds'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Threat Feeds Auto-Pull ({threatFeeds.length})</span>
        </button>
      </div>

      {/* Tab 1 & 2: IP Tables */}
      {(activeTab === 'blocklist' || activeTab === 'allowlist') && (
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-3">IP / CIDR RANGE</th>
                  <th className="pb-3">SCOPE</th>
                  <th className="pb-3">REASON / JUSTIFICATION</th>
                  <th className="pb-3">TOTAL HITS</th>
                  <th className="pb-3">ADDED BY</th>
                  <th className="pb-3">EXPIRATION</th>
                  <th className="pb-3 pr-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {(activeTab === 'blocklist' ? blocklist : allowlist).map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pl-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`font-bold ${entry.type === 'BLOCKLIST' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {entry.ip_cidr}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-300 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        {entry.scope}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-300 font-sans max-w-xs truncate" title={entry.reason}>
                      {entry.reason}
                    </td>
                    <td className="py-3.5 text-slate-200">{entry.hits_count.toLocaleString()}</td>
                    <td className="py-3.5 text-slate-400 font-sans text-[11px]">{entry.added_by}</td>
                    <td className="py-3.5 text-slate-400">{entry.expires_at}</td>
                    <td className="py-3.5 pr-3 text-right">
                      <button
                        onClick={() => removeIPEntry(entry.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
      )}

      {/* Tab 3: Threat Feeds Ingestion (FR-4.2) */}
      {activeTab === 'feeds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {threatFeeds.map((feed) => (
            <div key={feed.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {feed.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{feed.provider}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">{feed.name}</h3>
                </div>

                <button
                  onClick={() => syncThreatFeedNow(feed.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                  title="Synchronize feed now"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-400 break-all">
                {feed.url}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">
                  Indicators: <strong className="text-white font-mono">{feed.record_count.toLocaleString()} IPs</strong>
                </span>
                <span className="text-emerald-400 font-mono">Synced {feed.last_synced}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add IP/CIDR Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <form
            onSubmit={handleAddSubmit}
            className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-rose-400" />
                  Add IP or CIDR Subnet Rule
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enforce immediate allow or block rule on edge proxies
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Rule Policy Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  >
                    <option value="BLOCKLIST">BLOCKLIST (Drop Traffic)</option>
                    <option value="ALLOWLIST">ALLOWLIST (Bypass WAF)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Scope</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  >
                    <option value="GLOBAL">GLOBAL (All Nodes)</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.domain_name}>
                        {s.domain_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">IP Address or CIDR Range</label>
                <input
                  type="text"
                  required
                  value={formData.ip_cidr}
                  onChange={(e) => setFormData({ ...formData, ip_cidr: e.target.value })}
                  placeholder="e.g. 198.51.100.0/24 or 203.0.113.19"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason / Investigation Note</label>
                <textarea
                  rows={2}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-400 text-white transition-colors shadow-lg shadow-rose-500/20"
              >
                Save IP Policy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
