import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { USER_PERSONAS } from '../data/mockData';
import {
  Search,
  LayoutDashboard,
  Server,
  ShieldAlert,
  FlaskConical,
  FileSearch,
  CheckCircle,
  Ban,
  Globe2,
  GitBranch,
  RefreshCw,
  User,
  X,
  GitFork,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalCommandPalette: React.FC<Props> = ({ isOpen, onClose }) => {
  const { setActiveTab, setCurrentUser, syncAllNodes } = useApp();
  const [query, setQuery] = useState('');

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'overview', title: 'Go to Attack Analytics Dashboard', category: 'Navigation', icon: LayoutDashboard },
    { id: 'kill-chain', title: 'Go to Cyber Kill Chain & API Attack Lifecycle Flow', category: 'Navigation', icon: GitFork },
    { id: 'asm', title: 'Go to Application Security Management (ASM) & Shadow APIs', category: 'Navigation', icon: ShieldCheck },
    { id: 'fleet', title: 'Go to Fleet & Edge Nodes (Caddy, Envoy, SPOA)', category: 'Navigation', icon: Server },
    { id: 'rules', title: 'Go to OWASP CRS & SecLang Rule Editor', category: 'Navigation', icon: ShieldAlert },
    { id: 'sandbox', title: 'Go to Testing Sandbox (Go FTW Dry-Run)', category: 'Navigation', icon: FlaskConical },
    { id: 'logs', title: 'Go to Forensic Log Explorer (ClickHouse)', category: 'Navigation', icon: FileSearch },
    { id: 'exceptions', title: 'Go to False Positive Tuning & Exceptions', category: 'Navigation', icon: CheckCircle },
    { id: 'threat-intel', title: 'Go to Threat Intelligence & IP Lists', category: 'Navigation', icon: Ban },
    { id: 'sites', title: 'Go to Sites & Virtual Hosts Management', category: 'Navigation', icon: Globe2 },
    { id: 'audit', title: 'Go to Audit Trail & GitOps Declarative Policy', category: 'Navigation', icon: GitBranch },
  ];

  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Search Input */}
        <div className="relative border-b border-slate-800">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to module..."
            className="w-full pl-11 pr-11 py-3.5 text-xs bg-transparent text-white placeholder-slate-500 focus:outline-none font-mono"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1 text-xs">
          {/* Quick Actions */}
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Control Plane Commands
          </div>

          <button
            onClick={() => {
              syncAllNodes();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-cyan-950/40 text-cyan-300 transition-colors group"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <div className="flex-1">
              <div className="font-semibold text-slate-100 group-hover:text-cyan-200">
                Broadcast gRPC Hot-Reload to All Nodes
              </div>
              <div className="text-[10px] text-slate-400">Distribute SecLang policy in &lt; 1 sec</div>
            </div>
          </button>

          {/* Module Navigations */}
          <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Jump to Module
          </div>
          {filteredActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  setActiveTab(act.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-800/80 text-slate-200 transition-colors group"
              >
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                <div className="flex-1">
                  <div className="font-medium text-slate-200 group-hover:text-white">{act.title}</div>
                </div>
              </button>
            );
          })}

          {/* User Persona Switcher */}
          <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Switch Target Persona
          </div>
          {USER_PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setCurrentUser(p);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-800/80 text-slate-200 transition-colors"
            >
              <div className={`w-5 h-5 rounded ${p.avatar_color} text-white font-bold text-[10px] flex items-center justify-center`}>
                {p.name.charAt(0)}
              </div>
              <span className="font-medium text-slate-300">
                Switch to {p.name} ({p.role_title})
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
