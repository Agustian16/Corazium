import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SiteVHost } from '../types';
import {
  Globe2,
  Plus,
  Shield,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ExternalLink,
  X,
} from 'lucide-react';

export const SitesView: React.FC = () => {
  const { sites, setCurrentSiteId, setActiveTab, addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    domain_name: string;
    paranoia_level: 1 | 2 | 3 | 4;
    inbound_threshold: number;
    outbound_threshold: number;
  }>({
    name: 'Customer Portal',
    domain_name: 'portal.domain.com',
    paranoia_level: 2,
    inbound_threshold: 5,
    outbound_threshold: 4,
  });

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Site Created', `Virtual host ${form.domain_name} added to PostgreSQL core schema.`, 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-cyan-400" />
            Protected Sites & Virtual Hosts (PostgreSQL Core)
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Multi-tenant WAF domain management with dedicated Paranoia Levels and anomaly thresholds
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Add Virtual Host</span>
        </button>
      </div>

      {/* Grid of Protected Sites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sites.map((site) => (
          <div
            key={site.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{site.domain_name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {site.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{site.name}</p>
              </div>

              <button
                onClick={() => {
                  setCurrentSiteId(site.id);
                  setActiveTab('rules');
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
                title="Configure rules for this site"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">PARANOIA LEVEL</span>
                <div className="text-sm font-bold font-mono text-purple-300 mt-0.5">
                  PL {site.paranoia_level}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">THRESHOLD</span>
                <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                  In {site.inbound_threshold} / Out {site.outbound_threshold}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">BLOCKED 24H</span>
                <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
                  {site.blocked_24h.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">
                Nodes Attached: <strong className="text-white font-mono">{site.node_count} Proxies</strong>
              </span>
              <button
                onClick={() => {
                  setCurrentSiteId(site.id);
                  setActiveTab('logs');
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                Inspect Logs <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Site Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <form
            onSubmit={handleAddSite}
            className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  Register New Virtual Host
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enforce Coraza WAF inspection across a new domain or API service
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
                <label className="block text-slate-300 font-medium mb-1">Human-Friendly Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Payment Gateway Service"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Domain Name (FQDN)</label>
                <input
                  type="text"
                  required
                  value={form.domain_name}
                  onChange={(e) => setForm({ ...form, domain_name: e.target.value })}
                  placeholder="e.g. pay.domain.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Paranoia Level</label>
                  <select
                    value={form.paranoia_level}
                    onChange={(e) => setForm({ ...form, paranoia_level: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  >
                    <option value={1}>PL 1</option>
                    <option value={2}>PL 2</option>
                    <option value={3}>PL 3</option>
                    <option value={4}>PL 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Inbound Score</label>
                  <input
                    type="number"
                    value={form.inbound_threshold}
                    onChange={(e) => setForm({ ...form, inbound_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Outbound Score</label>
                  <input
                    type="number"
                    value={form.outbound_threshold}
                    onChange={(e) => setForm({ ...form, outbound_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
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
                className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
              >
                Save Site to Fleet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
