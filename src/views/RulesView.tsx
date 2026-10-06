import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomSecLangRule } from '../types';
import {
  ShieldAlert,
  Sliders,
  Code2,
  Check,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Tag,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

export const RulesView: React.FC = () => {
  const {
    currentSiteId,
    sites,
    crsCategories,
    toggleCRSCategory,
    updateSiteSettings,
    customRules,
    saveCustomRule,
    toggleRuleActive,
    deleteCustomRule,
    setActiveTab,
  } = useApp();

  // Selected site for tuning
  const activeSite = sites.find((s) => s.id === (currentSiteId === 'ALL' ? 'site-api' : currentSiteId)) || sites[0];

  // Local site thresholds state
  const [paranoiaLevel, setParanoiaLevel] = useState<1 | 2 | 3 | 4>(activeSite.paranoia_level);
  const [inboundThreshold, setInboundThreshold] = useState<number>(activeSite.inbound_threshold);
  const [outboundThreshold, setOutboundThreshold] = useState<number>(activeSite.outbound_threshold);

  // Custom Rule Editor Modal state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('code');

  // Rule edit form
  const [ruleForm, setRuleForm] = useState<{
    id?: string;
    rule_id: number;
    name: string;
    match_target: string;
    operator: string;
    operator_param: string;
    phase: number;
    action: 'deny' | 'allow' | 'log' | 'drop';
    status_code: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    seclang_raw: string;
    tags: string[];
  }>({
    rule_id: 900005,
    name: 'Custom WAF Rule',
    match_target: 'ARGS:user_id',
    operator: '@rx',
    operator_param: '(?i)(union\\s+select|select\\s+@@version)',
    phase: 2,
    action: 'deny',
    status_code: 403,
    severity: 'CRITICAL',
    seclang_raw: `SecRule ARGS:user_id "@rx (?i)(union\\s+select|select\\s+@@version)" \\
    "id:900005,\\
    phase:2,\\
    deny,\\
    status:403,\\
    msg:'Custom SQL Injection Pattern Detected',\\
    logdata:'Matched Data: %{TX.0} found within %{MATCHED_VAR_NAME}',\\
    tag:'custom-waf',\\
    severity:'CRITICAL'"`,
    tags: ['custom-waf', 'sqli'],
  });

  const handleSaveThresholds = () => {
    updateSiteSettings(activeSite.id, paranoiaLevel, inboundThreshold, outboundThreshold);
  };

  const handleOpenNewRule = () => {
    const newId = Math.floor(Math.random() * 80000) + 900010;
    setRuleForm({
      rule_id: newId,
      name: 'Block Malicious Pattern',
      match_target: 'REQUEST_HEADERS:User-Agent',
      operator: '@rx',
      operator_param: '(?i)(curl|wget|python-requests)',
      phase: 1,
      action: 'deny',
      status_code: 403,
      severity: 'HIGH',
      seclang_raw: `SecRule REQUEST_HEADERS:User-Agent "@rx (?i)(curl|wget|python-requests)" \\
    "id:${newId},\\
    phase:1,\\
    deny,\\
    status:403,\\
    msg:'Automated CLI HTTP Client Detected',\\
    tag:'anti-bot',\\
    severity:'HIGH'"`,
      tags: ['anti-bot', 'cli-block'],
    });
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomRule({
      ...ruleForm,
      site_id: activeSite.id,
    });
    setIsRuleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            OWASP CRS v4 & SecLang Rule Management
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Visual switches for OWASP Core Rule Set, Paranoia Level calibration, and embedded SecLang rule authoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('sandbox')}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors"
          >
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Open Testing Sandbox (Go FTW)</span>
          </button>

          <button
            onClick={handleOpenNewRule}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create Custom Rule</span>
          </button>
        </div>
      </div>

      {/* Paranoia Level & Anomaly Threshold Card (FR-2.2) */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              OWASP CRS Paranoia Level & Threshold Tuning
            </h2>
            <p className="text-xs text-slate-400">
              Active Scope: <strong className="text-cyan-300 font-mono">{activeSite.domain_name}</strong> ({activeSite.name})
            </p>
          </div>

          <button
            onClick={handleSaveThresholds}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Save Scope Policy
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Paranoia Level Slider */}
          <div className="lg:col-span-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Paranoia Level (PL 1 - PL 4)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Higher levels activate aggressive heuristic inspection rules at the cost of potential false positives.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PL {paranoiaLevel} Active
              </span>
            </div>

            {/* Visual Level Selector Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { pl: 1, label: 'PL 1: Baseline', desc: 'Low false positives, standard protection' },
                { pl: 2, label: 'PL 2: Recommended', desc: 'Enterprise default, protects sensitive data' },
                { pl: 3, label: 'PL 3: High Security', desc: 'Strict inspection, suitable for banking/auth' },
                { pl: 4, label: 'PL 4: Extreme', desc: 'Max paranoia, airgapped/defense-grade' },
              ].map((item) => (
                <button
                  key={item.pl}
                  type="button"
                  onClick={() => setParanoiaLevel(item.pl as 1 | 2 | 3 | 4)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    paranoiaLevel === item.pl
                      ? 'bg-purple-950/40 border-purple-500/60 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{item.label}</div>
                  <div className="text-[10px] mt-1 text-slate-400 leading-tight">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Anomaly Threshold Inputs */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Anomaly Scoring Thresholds
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cumulative score required to trigger blocking action
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Inbound Threshold</span>
                  <span className="font-mono text-cyan-400 font-bold">{inboundThreshold} (Default: 5)</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={inboundThreshold}
                  onChange={(e) => setInboundThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Outbound Threshold</span>
                  <span className="font-mono text-cyan-400 font-bold">{outboundThreshold} (Default: 4)</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={outboundThreshold}
                  onChange={(e) => setOutboundThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OWASP CRS v4 Visual Switch Categories (FR-2.1) */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">OWASP Core Rule Set (CRS v4) Attack Categories</h2>
          <p className="text-xs text-slate-400">
            Granular category toggles with real-time compilation into Coraza SecLang runtime
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {crsCategories.map((cat) => (
            <div
              key={cat.id}
              className={`p-4 rounded-xl border transition-all ${
                cat.enabled
                  ? 'bg-slate-900/80 border-slate-700/80 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-300">{cat.code_range}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      cat.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                      cat.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {cat.severity}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white mt-1">{cat.name}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCRSCategory(cat.id)}
                  className={`p-1 rounded-lg transition-colors ${
                    cat.enabled ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-600 hover:text-slate-500'
                  }`}
                  title={cat.enabled ? 'Click to disable' : 'Click to enable'}
                >
                  {cat.enabled ? (
                    <ToggleRight className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-600" />
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Rules: <strong className="text-slate-300">{cat.rules_count}</strong></span>
                <span className="truncate max-w-[150px] font-mono text-slate-500">
                  eg: {cat.sample_attacks[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom SecLang Rules Repository (FR-2.3) */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Custom SecLang Rules Repository</h2>
            <p className="text-xs text-slate-400">Organization-specific heuristic and zero-day patch rules</p>
          </div>
          <button
            onClick={handleOpenNewRule}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            + Add SecLang Rule
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-3">RULE ID</th>
                <th className="pb-3">NAME & DESCRIPTION</th>
                <th className="pb-3">PHASE</th>
                <th className="pb-3">ACTION</th>
                <th className="pb-3">TARGET</th>
                <th className="pb-3">SEVERITY</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3 pr-3 text-right">CONTROLS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {customRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-3 text-cyan-400 font-bold">
                    #{rule.rule_id}
                  </td>
                  <td className="py-3 font-sans">
                    <div className="font-semibold text-slate-200">{rule.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Author: {rule.created_by}</span>
                      <span>•</span>
                      <span className="font-mono">{rule.tags.join(', ')}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-300">Phase {rule.phase}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300">
                      {rule.action} ({rule.status_code})
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 max-w-xs truncate" title={rule.match_target}>
                    {rule.match_target}
                  </td>
                  <td className="py-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      rule.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400' :
                      rule.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => toggleRuleActive(rule.rule_id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        rule.is_active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {rule.is_active ? 'ACTIVE' : 'MUTED'}
                    </button>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setRuleForm({
                            ...rule,
                            operator_param: rule.operator_param || '',
                          });
                          setIsRuleModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors font-sans text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCustomRule(rule.rule_id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dual Mode Rule Editor Modal (Visual Builder & Monaco Code Editor FR-2.3) */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-purple-400" />
                  RULE EDITOR: CUSTOM_RULE_{ruleForm.rule_id}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual Builder & Monaco SecLang Code Editor with real-time Go-Coraza linter
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditorMode('visual')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    editorMode === 'visual'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Visual Builder
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('code')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    editorMode === 'code'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monaco SecLang Code Editor
                </button>
              </div>
            </div>

            {editorMode === 'visual' ? (
              /* Visual Form Builder */
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Rule ID</label>
                    <input
                      type="number"
                      value={ruleForm.rule_id}
                      onChange={(e) => setRuleForm({ ...ruleForm, rule_id: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Rule Name</label>
                    <input
                      type="text"
                      value={ruleForm.name}
                      onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Match Target Variable</label>
                    <input
                      type="text"
                      value={ruleForm.match_target}
                      onChange={(e) => setRuleForm({ ...ruleForm, match_target: e.target.value })}
                      placeholder="e.g. ARGS:user_id, REQUEST_HEADERS:User-Agent"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Operator</label>
                    <select
                      value={ruleForm.operator}
                      onChange={(e) => setRuleForm({ ...ruleForm, operator: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    >
                      <option value="@rx">@rx (Regular Expression)</option>
                      <option value="@streq">@streq (Exact String Match)</option>
                      <option value="@contains">@contains (Sub-string Match)</option>
                      <option value="@beginsWith">@beginsWith (Prefix Match)</option>
                      <option value="@ipMatch">@ipMatch (CIDR / IP Match)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Operator Pattern / Regex</label>
                  <input
                    type="text"
                    value={ruleForm.operator_param}
                    onChange={(e) => setRuleForm({ ...ruleForm, operator_param: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Inspection Phase</label>
                    <select
                      value={ruleForm.phase}
                      onChange={(e) => setRuleForm({ ...ruleForm, phase: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    >
                      <option value={1}>Phase 1 (Request Headers)</option>
                      <option value={2}>Phase 2 (Request Body)</option>
                      <option value={3}>Phase 3 (Response Headers)</option>
                      <option value={4}>Phase 4 (Response Body)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Disruptive Action</label>
                    <select
                      value={ruleForm.action}
                      onChange={(e) => setRuleForm({ ...ruleForm, action: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    >
                      <option value="deny">deny (Block)</option>
                      <option value="allow">allow (Pass through)</option>
                      <option value="drop">drop (TCP Reset)</option>
                      <option value="log">log (Audit only)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Severity</label>
                    <select
                      value={ruleForm.severity}
                      onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* Monaco SecLang Code Editor Simulation */
              <div className="space-y-2">
                <div className="rounded-xl border border-slate-700 bg-[#070b14] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
                    <span className="font-mono text-slate-400 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-purple-400" />
                      seclang_rule_{ruleForm.rule_id}.conf
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Syntax Validated (0 Errors, 0 Warnings)
                    </span>
                  </div>

                  <div className="p-3 font-mono text-xs text-slate-200">
                    <textarea
                      rows={10}
                      value={ruleForm.seclang_raw}
                      onChange={(e) => setRuleForm({ ...ruleForm, seclang_raw: e.target.value })}
                      className="w-full bg-transparent text-emerald-300/90 focus:outline-none font-mono leading-relaxed resize-none selection:bg-purple-500/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsRuleModalOpen(false);
                  setActiveTab('sandbox');
                }}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Test in Sandbox First
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRule}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white transition-colors shadow-lg shadow-purple-500/20"
                >
                  Compile & Save Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
