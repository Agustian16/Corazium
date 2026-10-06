import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Server,
  ShieldAlert,
  FlaskConical,
  FileSearch,
  CheckCircle,
  Ban,
  Globe2,
  GitBranch,
  Radio,
  Flame,
  GitFork,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, logs, exceptions, nodes, isLiveStreaming, setIsLiveStreaming } = useApp();

  const blockedCount = logs.filter((l) => l.action_taken === 'DENY').length;
  const pendingNodes = nodes.filter((n) => n.sync_status === 'PENDING_UPDATE').length;

  const navItems = [
    {
      id: 'overview',
      label: 'Attack Analytics',
      badge: 'Live',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      icon: LayoutDashboard,
      module: 'Module 4',
    },
    {
      id: 'kill-chain',
      label: 'Cyber Kill Chain',
      badge: 'API Flow',
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
      icon: GitFork,
      module: 'API Threat Flow',
    },
    {
      id: 'asm',
      label: 'AppSec Management (ASM)',
      badge: 'Posture A-',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      icon: ShieldCheck,
      module: 'AppSec & RASP',
    },
    {
      id: 'fleet',
      label: 'Fleet & Edge Nodes',
      badge: pendingNodes > 0 ? `${pendingNodes} Sync` : `${nodes.length} Up`,
      badgeColor: pendingNodes > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300',
      icon: Server,
      module: 'Module 1',
    },
    {
      id: 'rules',
      label: 'OWASP CRS & SecLang',
      badge: 'CRS v4',
      badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
      icon: ShieldAlert,
      module: 'Module 2',
    },
    {
      id: 'sandbox',
      label: 'Testing Sandbox',
      badge: 'Go FTW',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      icon: FlaskConical,
      module: 'Module 2.4',
    },
    {
      id: 'logs',
      label: 'Forensic Log Explorer',
      badge: `${blockedCount} Blocked`,
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
      icon: FileSearch,
      module: 'Module 3',
    },
    {
      id: 'exceptions',
      label: 'False Positive Tuning',
      badge: `${exceptions.length} Active`,
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      icon: CheckCircle,
      module: 'Module 3.3',
    },
    {
      id: 'threat-intel',
      label: 'Threat Feeds & IPs',
      badge: '4 Feeds',
      badgeColor: 'bg-slate-800 text-slate-300',
      icon: Ban,
      module: 'Module 4.2',
    },
    {
      id: 'sites',
      label: 'Sites & VHosts',
      badge: 'Multi-Tenant',
      badgeColor: 'bg-slate-800 text-slate-300',
      icon: Globe2,
      module: 'Module 5',
    },
    {
      id: 'audit',
      label: 'Audit Trail & GitOps',
      badge: 'YAML CI/CD',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
      icon: GitBranch,
      module: 'Module 5',
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-[#070b14]/90 backdrop-blur-xl flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-3">
        {/* Live Attack Stream Status Header */}
        <div className="mb-3 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isLiveStreaming && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLiveStreaming ? 'bg-rose-500' : 'bg-slate-500'}`}></span>
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {isLiveStreaming ? 'Attack Stream ON' : 'Stream Paused'}
            </span>
          </div>
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {isLiveStreaming ? 'Pause' : 'Resume'}
          </button>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            CONTROL PLANE MODULES
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/70 to-slate-900 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ml-1.5 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Telemetry Card: ClickHouse & Engine Latency */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              ClickHouse Ingestion
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left pt-1">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-400">Throughput</div>
              <div className="text-xs font-mono font-bold text-slate-200">14.2k <span className="text-[10px] text-slate-400 font-normal">log/s</span></div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-400">WAF Overhead</div>
              <div className="text-xs font-mono font-bold text-emerald-400">&lt; 1.4ms</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>SLA: &lt; 2.0ms</span>
            <span className="text-cyan-400 font-mono">NFR-1.1 Met</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
