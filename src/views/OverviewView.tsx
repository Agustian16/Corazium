import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Activity,
  Zap,
  TrendingUp,
  AlertTriangle,
  Globe,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Ban,
  Clock,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { logs, nodes, setSelectedLogForModal, setActiveTab, addIPToBlacklist } = useApp();

  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  // Compute metrics
  const totalRps = nodes.reduce((sum, n) => sum + n.rps, 0);
  const blockedLogs = logs.filter((l) => l.action_taken === 'DENY');
  const allowedLogs = logs.filter((l) => l.action_taken === 'ALLOW');
  const avgLatency = (nodes.reduce((sum, n) => sum + n.latency_ms, 0) / nodes.length).toFixed(2);
  const blockRatio = ((blockedLogs.length / (logs.length || 1)) * 100).toFixed(1);

  // Time-series mock data points
  const timeSeriesData = [
    { time: '00:00', total: 3800, attacks: 120 },
    { time: '03:00', total: 2400, attacks: 95 },
    { time: '06:00', total: 3100, attacks: 140 },
    { time: '09:00', total: 5200, attacks: 310 },
    { time: '12:00', total: 6800, attacks: 520 },
    { time: '15:00', total: 7400, attacks: 610 },
    { time: '18:00', total: 6900, attacks: 480 },
    { time: '21:00', total: 5600, attacks: 340 },
  ];

  // Top Triggered Rules
  const topRules = [
    { id: 942100, name: 'SQL Injection via libinjection', category: 'SQLi', count: 14820, percent: 46, color: 'bg-rose-500' },
    { id: 941100, name: 'XSS Attack via libinjection', category: 'XSS', count: 8310, percent: 26, color: 'bg-amber-500' },
    { id: 932100, name: 'Remote Command Execution Metachars', category: 'RCE', count: 4210, percent: 13, color: 'bg-purple-500' },
    { id: 930100, name: 'Path Traversal / LFI Directory Probes', category: 'LFI', count: 2840, percent: 9, color: 'bg-cyan-500' },
    { id: 913100, name: 'Automated Security Scanner Detection', category: 'Bot/Recon', count: 1980, percent: 6, color: 'bg-blue-500' },
  ];

  // Top Targeted Endpoints
  const targetedEndpoints = [
    { path: '/api/v1/login', method: 'POST', hits: 8420, risk: 'HIGH', host: 'api.domain.com' },
    { path: '/products/search', method: 'GET', hits: 5120, risk: 'MEDIUM', host: 'shop.domain.com' },
    { path: '/api/v2/system/health', method: 'GET', hits: 3940, risk: 'CRITICAL', host: 'api.domain.com' },
    { path: '/oauth/v2/token', method: 'POST', hits: 2810, risk: 'HIGH', host: 'auth.domain.com' },
    { path: '/download', method: 'GET', hits: 1450, risk: 'HIGH', host: 'admin.internal.io' },
  ];

  // Top Attacking Sources
  const topAttackers = [
    { ip: '185.220.101.5', country: 'Russia (RU)', asn: 'AS13335 Tor Project', hits: 3410, blockStatus: 'BLOCKED' },
    { ip: '45.33.32.156', country: 'United States (US)', asn: 'AS63949 Linode', hits: 2190, blockStatus: 'BLOCKED' },
    { ip: '103.21.244.12', country: 'Singapore (SG)', asn: 'AS132203 Tencent', hits: 1840, blockStatus: 'ACTIVE' },
    { ip: '194.26.29.112', country: 'Netherlands (NL)', asn: 'AS49505 Serverius', hits: 1290, blockStatus: 'BLOCKED' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            Attack Analytics & Real-Time Monitoring
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            OWASP Coraza WAF Engine v3 & OWASP CRS v4 High-Throughput Threat Intelligence
          </p>
        </div>

        {/* Time range picker */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          {(['1h', '6h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards (FR-4.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Traffic */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Throughput</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{totalRps.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-400">Req / sec</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs previous window</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Blocked Requests */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-rose-900/40 shadow-lg relative overflow-hidden group hover:border-rose-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Blocked Malicious Requests</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">32,180</span>
            <span className="text-xs font-medium text-slate-400">events (24h)</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-300">
            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">
              CRITICAL
            </span>
            <span>Zero bypasses reported</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Block Ratio */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Attack Block Ratio</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-300">{blockRatio}%</span>
            <span className="text-xs font-medium text-slate-400">of all traffic</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Filtered by OWASP CRS v4 Anomaly Score
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Overhead Latency */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-900/30 shadow-lg relative overflow-hidden group hover:border-emerald-800/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">WAF Latency Overhead</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{avgLatency} ms</span>
            <span className="text-xs font-medium text-slate-400">avg evaluation</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium">SLA Target: &lt; 2.0 ms</span>
            <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              OPTIMAL
            </span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Main Charts Row: Traffic vs Attack Trend (Chart 1) & Top OWASP CRS Rules (Chart 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Traffic vs Attack Trend Time-Series */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-white">Traffic vs Attack Trend (Time-Series)</h2>
              <p className="text-xs text-slate-400">Total Requests vs Blocked Attack Vectors over 24 hours</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                <span className="text-slate-300">Total Traffic (Req/s)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-300">Blocked Attacks</span>
              </div>
            </div>
          </div>

          {/* Custom Responsive SVG Chart */}
          <div className="h-64 w-full relative pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[40, 80, 120, 160].map((y) => (
                <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
              ))}

              {/* Total Traffic Area & Line */}
              <path
                d="M 0,110 Q 100,140 200,120 T 400,60 T 500,40 T 600,60 T 700,80 L 700,200 L 0,200 Z"
                fill="url(#cyanGradient)"
              />
              <path
                d="M 0,110 Q 100,140 200,120 T 400,60 T 500,40 T 600,60 T 700,80"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
              />

              {/* Attack Trend Area & Line */}
              <path
                d="M 0,185 Q 100,188 200,180 T 400,150 T 500,135 T 600,150 T 700,165 L 700,200 L 0,200 Z"
                fill="url(#roseGradient)"
              />
              <path
                d="M 0,185 Q 100,188 200,180 T 400,150 T 500,135 T 600,150 T 700,165"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
              />

              {/* Data points */}
              {timeSeriesData.map((d, i) => {
                const x = (i / (timeSeriesData.length - 1)) * 680 + 10;
                return (
                  <g key={i}>
                    <circle cx={x} cy={60 + (i % 3) * 20} r="3.5" fill="#06b6d4" />
                    <circle cx={x} cy={150 + (i % 2) * 15} r="3" fill="#f43f5e" />
                  </g>
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-2 px-2">
              {timeSeriesData.map((d) => (
                <span key={d.time}>{d.time}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Top 10 Triggered OWASP Rules */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Top OWASP CRS Rules</h2>
              <p className="text-xs text-slate-400">Highest triggered attack signatures</p>
            </div>
            <button
              onClick={() => setActiveTab('rules')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              Tune Rules <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 pt-1">
            {topRules.map((rule) => (
              <div key={rule.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-cyan-400 font-semibold">{rule.id}</span>
                    <span className="text-slate-300 truncate">{rule.category}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 text-[11px]">{rule.count.toLocaleString()}</span>
                    <span className="text-slate-200 font-semibold">{rule.percent}%</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${rule.color}`}
                    style={{ width: `${rule.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>CRS Paranoia Level: <strong className="text-slate-200">PL 2 Active</strong></span>
            <span className="text-emerald-400 font-mono">Threshold: In 5 / Out 4</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Targeted Endpoints & Top Attacking IPs & Live Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Targeted Endpoints */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Targeted URI Endpoints</h2>
              <p className="text-xs text-slate-400">High-risk paths requiring strict inspection</p>
            </div>
            <button
              onClick={() => setActiveTab('exceptions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View Exceptions <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {targetedEndpoints.map((ep, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    ep.method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {ep.method}
                  </span>
                  <div className="truncate">
                    <span className="font-mono text-slate-200">{ep.path}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{ep.host}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-slate-400">{ep.hits.toLocaleString()} attacks</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    ep.risk === 'CRITICAL' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                    ep.risk === 'HIGH' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {ep.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Attacking Sources & Rapid Blacklist */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Top Attacking IP Sources</h2>
              <p className="text-xs text-slate-400">Origin ASNs & Autonomous Threat Blocking</p>
            </div>
            <button
              onClick={() => setActiveTab('threat-intel')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              IP Lists <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {topAttackers.map((att, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-mono text-slate-200 font-semibold">{att.ip}</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {att.country} • {att.asn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono text-rose-400">{att.hits.toLocaleString()} hits</span>
                  {att.blockStatus === 'BLOCKED' ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      BLOCKED
                    </span>
                  ) : (
                    <button
                      onClick={() => addIPToBlacklist(att.ip, 'High volume malicious attacks detected on overview')}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/50 transition-colors flex items-center gap-1"
                    >
                      <Ban className="w-3 h-3" />
                      Block IP
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Incidents Live Feed Table */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent WAF Blocked Transactions
            </h2>
            <p className="text-xs text-slate-400">Click any transaction to launch deep forensic inspection</p>
          </div>
          <button
            onClick={() => setActiveTab('logs')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            Launch Forensic Explorer (ClickHouse) <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2.5 pl-2">TIMESTAMP</th>
                <th className="pb-2.5">CLIENT IP & ORIGIN</th>
                <th className="pb-2.5">METHOD</th>
                <th className="pb-2.5">TARGET URI</th>
                <th className="pb-2.5">RULE ID</th>
                <th className="pb-2.5">ACTION</th>
                <th className="pb-2.5 pr-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {blockedLogs.slice(0, 5).map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLogForModal(log)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 pl-2 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 text-slate-200">
                    <span className="font-semibold">{log.client_ip}</span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      {log.client_country} ({log.client_country_code})
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      log.http_method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {log.http_method}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300 max-w-xs truncate" title={log.uri}>
                    {log.uri}
                  </td>
                  <td className="py-2.5 text-rose-400 font-bold">
                    {log.matched_rule_ids[0] || 'N/A'}
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      DENY (403)
                    </span>
                  </td>
                  <td className="py-2.5 pr-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLogForModal(log);
                      }}
                      className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors font-sans"
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
    </div>
  );
};
