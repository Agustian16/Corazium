import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiscoveredAPIEndpoint, VulnerabilityCorrelation, DLPMaskingRule } from '../types';
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  Lock,
  Layers,
  FileCode,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Zap,
  Globe,
  Radio,
  EyeOff,
  Filter,
  Check,
  ToggleLeft,
  ToggleRight,
  Upload,
  Activity,
  X,
  FileText,
} from 'lucide-react';

export const ASMView: React.FC = () => {
  const {
    asmPosture,
    discoveredApis,
    cveCorrelations,
    dlpRules,
    toggleApiQuarantine,
    toggleDlpRule,
    enforceOpenApiSchema,
    addToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'cve-shield' | 'dlp'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Filter API inventory
  const filteredApis = discoveredApis.filter((api) => {
    if (filterStatus !== 'ALL' && api.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        api.path.toLowerCase().includes(q) ||
        api.host.toLowerCase().includes(q) ||
        api.auth_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const shadowApis = discoveredApis.filter((a) => a.status === 'SHADOW_API');
  const zombieApis = discoveredApis.filter((a) => a.status === 'ZOMBIE_API');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Application Security Management (ASM)
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Automated API asset discovery, OpenAPI schema compliance, runtime CVE shield correlation, and data loss prevention (DLP)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={enforceOpenApiSchema}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>Enforce OpenAPI Schema</span>
          </button>
        </div>
      </div>

      {/* Security Posture Executive Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Posture Rating */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Security Posture Grade</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              GRADE {asmPosture.grade}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">{asmPosture.overall_score}</span>
            <span className="text-xs font-medium text-slate-400">/ 100 Health Score</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Top tier OWASP API 2023 posture</span>
          </div>
        </div>

        {/* Shadow & Zombie APIs */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-900/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Shadow & Zombie APIs</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-400">
              {shadowApis.length + zombieApis.length}
            </span>
            <span className="text-xs font-medium text-slate-400">unauthorized routes</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-300">
            <span>{shadowApis.length} Shadow • {zombieApis.length} Zombie Deprecated</span>
          </div>
        </div>

        {/* Schema Compliance */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">OpenAPI Compliance</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileCode className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-300">
              {asmPosture.schema_compliance_percent}%
            </span>
            <span className="text-xs font-medium text-slate-400">conformance</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {asmPosture.total_apis_discovered} total active endpoints mapped
          </div>
        </div>

        {/* Runtime CVEs Shielded */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Runtime CVEs Shielded</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-purple-300">
              {cveCorrelations.length} CVEs
            </span>
            <span className="text-xs font-medium text-slate-400">virtual patches</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400">
            <span>Zero backend code changes required</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: API Inventory vs Runtime CVE Shield vs DLP Masking */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'inventory'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>API Discovery & Inventory ({discoveredApis.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cve-shield')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'cve-shield'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Runtime CVE Shield & RASP ({cveCorrelations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dlp')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'dlp'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          <span>Data Loss Prevention & PII Masking ({dlpRules.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: API Discovery & Inventory (Shadow API Hunter) */}
      {activeSubTab === 'inventory' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Live Discovered API Endpoints & Shadow API Hunter
              </h2>
              <p className="text-xs text-slate-400">
                Discovered via traffic inspection with automatic drift detection against OpenAPI specifications
              </p>
            </div>

            {/* Search and Status filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter endpoints..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono"
              >
                <option value="ALL">All Status</option>
                <option value="COMPLIANT">Compliant</option>
                <option value="SHADOW_API">Shadow API (Undocumented)</option>
                <option value="ZOMBIE_API">Zombie API (Deprecated)</option>
                <option value="DRIFT_DETECTED">Drift Detected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-3">ENDPOINT ROUTE</th>
                  <th className="pb-3">VHOST</th>
                  <th className="pb-3">AUTH TYPE</th>
                  <th className="pb-3">SENSITIVITY</th>
                  <th className="pb-3">SCHEMA STATUS</th>
                  <th className="pb-3">TRAFFIC RPS</th>
                  <th className="pb-3 pr-3 text-right">QUARANTINE / CONTROL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredApis.map((api) => (
                  <tr key={api.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          api.method === 'POST' ? 'bg-amber-500/20 text-amber-300' :
                          api.method === 'GET' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {api.method}
                        </span>
                        <span className="font-semibold text-slate-200">{api.path}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                        Params: {api.parameters_detected.join(', ')}
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-300 font-sans">{api.host}</td>

                    <td className="py-3.5">
                      <span className="text-[11px] text-slate-300 font-sans">{api.auth_type}</span>
                    </td>

                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        api.sensitivity === 'CRITICAL_PII' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        api.sensitivity === 'FINANCIAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        api.sensitivity === 'AUTHENTICATION' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {api.sensitivity}
                      </span>
                    </td>

                    <td className="py-3.5">
                      {api.status === 'COMPLIANT' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          COMPLIANT
                        </span>
                      )}
                      {api.status === 'SHADOW_API' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                          SHADOW API (UNMAPPED)
                        </span>
                      )}
                      {api.status === 'ZOMBIE_API' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ZOMBIE (DEPRECATED)
                        </span>
                      )}
                      {api.status === 'DRIFT_DETECTED' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          DRIFT ({api.schema_violations} extra params)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 text-slate-300 font-bold">{api.rps} rps</td>

                    <td className="py-3.5 pr-3 text-right">
                      <button
                        onClick={() => toggleApiQuarantine(api.id)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                          api.is_quarantined
                            ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-rose-300 hover:border-rose-500/50'
                        }`}
                      >
                        {api.is_quarantined ? 'Quarantined (Blocked)' : 'Quarantine'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Runtime Vulnerability (SCA / RASP) Correlation */}
      {activeSubTab === 'cve-shield' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Runtime CVE Shield & RASP Virtual Patching
              </h2>
              <p className="text-xs text-slate-400">
                Coraza WAF inspects and shields known vulnerable backend dependencies without rebuilding microservice container images
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {cveCorrelations.map((cve) => (
                <div key={cve.cve_id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-rose-400">{cve.cve_id}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          CVSS {cve.cvss_score} {cve.severity}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white mt-1">{cve.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cve.affected_component}</p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      ACTIVE SHIELD
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-cyan-300">Coraza Shield Rule #{cve.coraza_mitigation_rule}</div>
                    <div className="text-[11px] text-slate-400 truncate">{cve.coraza_rule_name}</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Attack Attempts Blocked (24h):</span>
                    <span className="font-mono text-emerald-400 font-bold">{cve.attack_attempts_blocked_24h} incidents</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Data Loss Prevention (DLP) & PII Scrubbing */}
      {activeSubTab === 'dlp' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-cyan-400" />
                Data Loss Prevention (DLP) & Sensitive PII Masking
              </h2>
              <p className="text-xs text-slate-400">
                Redacts sensitive customer credentials, payment numbers, and tokens in audit logs and HTTP responses (NFR-2.3)
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {dlpRules.map((rule) => (
              <div key={rule.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{rule.pattern_name}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {rule.data_type}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    Mask Output: <code className="text-emerald-300">{rule.mask_format}</code>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Pattern Regex: {rule.match_regex}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white">{rule.hits_24h.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block font-sans">redacted (24h)</span>
                  </div>

                  <button
                    onClick={() => toggleDlpRule(rule.id)}
                    className="p-1 rounded-lg text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {rule.is_enabled ? (
                      <ToggleRight className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
