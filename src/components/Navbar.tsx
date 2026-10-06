import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USER_PERSONAS } from '../data/mockData';
import {
  Shield,
  Activity,
  RefreshCw,
  Search,
  Globe,
  User,
  ChevronDown,
  Check,
  Server,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const {
    currentSiteId,
    setCurrentSiteId,
    sites,
    nodes,
    currentUser,
    setCurrentUser,
    syncAllNodes,
    isSyncingNodes,
    isLiveStreaming,
  } = useApp();

  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const selectedSite = sites.find((s) => s.id === currentSiteId);
  const onlineNodes = nodes.filter((n) => n.status === 'ONLINE').length;
  const avgLatency = (nodes.reduce((acc, n) => acc + n.latency_ms, 0) / nodes.length).toFixed(2);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Brand & Engine Specs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base text-white">
                  CORAZA<span className="text-cyan-400">CONSOLE</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  WAAP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Core Engine: <strong className="text-slate-300">v3.2.1</strong></span>
                <span className="text-slate-600">•</span>
                <span>Ruleset: <strong className="text-purple-300">OWASP CRS v4</strong></span>
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-3 ml-4 pl-4 border-l border-slate-800">
            {/* Cluster Health Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium">{onlineNodes}/{nodes.length} Nodes</span>
              <span className="text-slate-500">|</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300">{avgLatency}ms Avg</span>
            </div>

            {/* Zero-downtime gRPC status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>gRPC Stream: Zero-Downtime Hot Reload</span>
            </div>
          </div>
        </div>

        {/* Center: Global Site Selector & Command Palette */}
        <div className="flex items-center gap-3">
          {/* Site Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 border border-slate-700/70 hover:border-cyan-500/50 text-slate-200 transition-all shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="max-w-[140px] truncate">
                {currentSiteId === 'ALL' ? 'All Virtual Hosts' : selectedSite?.domain_name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isSiteDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-60 rounded-xl bg-[#0f172a] border border-slate-700/80 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setIsSiteDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Select Scope / Virtual Host
                </div>
                <button
                  onClick={() => {
                    setCurrentSiteId('ALL');
                    setIsSiteDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-800/70 ${
                    currentSiteId === 'ALL' ? 'text-cyan-400 font-semibold bg-cyan-950/20' : 'text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    All Virtual Hosts (Global Fleet)
                  </span>
                  {currentSiteId === 'ALL' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <div className="my-1 border-t border-slate-800" />
                {sites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => {
                      setCurrentSiteId(site.id);
                      setIsSiteDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-800/70 ${
                      currentSiteId === site.id ? 'text-cyan-400 font-semibold bg-cyan-950/20' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-200">{site.domain_name}</div>
                      <div className="text-[10px] text-slate-400">PL {site.paranoia_level} • {site.name}</div>
                    </div>
                    {currentSiteId === site.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search rules, nodes, logs...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: gRPC Sync Trigger, Persona Switcher */}
        <div className="flex items-center gap-3">
          {/* gRPC Sync Button */}
          <button
            onClick={syncAllNodes}
            disabled={isSyncingNodes}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isSyncingNodes
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 cursor-wait'
                : 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 border-cyan-500/40 hover:border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
            }`}
            title="Broadcast rules and exclusions to all edge nodes via gRPC stream (<1s target)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNodes ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">
              {isSyncingNodes ? 'Broadcasting gRPC...' : 'Push Config Stream'}
            </span>
          </button>

          {/* Persona / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className={`w-7 h-7 rounded-md ${currentUser.avatar_color} flex items-center justify-center text-white font-bold text-xs shadow-inner`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400">{currentUser.role_title}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0f172a] border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                <div className="px-3.5 py-1.5 border-b border-slate-800">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch User Persona (PRD Roles)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Test role-tailored workflows (SecOps, SecEng, DevOps)
                  </p>
                </div>
                <div className="py-1">
                  {USER_PERSONAS.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => {
                        setCurrentUser(persona);
                        setIsUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-slate-800/80 ${
                        currentUser.id === persona.id ? 'bg-cyan-950/30' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${persona.avatar_color} flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5`}>
                        {persona.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">{persona.name}</span>
                          {currentUser.id === persona.id && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-cyan-400 font-medium">{persona.role_title}</div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                          {persona.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
