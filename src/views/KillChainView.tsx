import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { KillChainStageDetail, KillChainAttackScenario } from '../types';
import {
  ShieldAlert,
  Terminal,
  Copy,
  Ban,
  CheckCircle2,
  Globe,
  Clock,
  Sparkles,
  Lock,
  Crosshair,
  Activity,
  MapPin,
  Network,
} from 'lucide-react';

type StageStatus = KillChainStageDetail['status'];

function getStatusColors(status: StageStatus) {
  switch (status) {
    case 'BLOCKED':
      return { fill: '#3b0a0a', stroke: '#ef4444', text: 'text-rose-300', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', dot: '#ef4444' };
    case 'DETECTED':
      return { fill: '#451a03', stroke: '#f59e0b', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', dot: '#f59e0b' };
    case 'ATTEMPTED':
      return { fill: '#2e1065', stroke: '#a855f7', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', dot: '#a855f7' };
    case 'NEUTRALIZED':
      return { fill: '#052e16', stroke: '#22c55e', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', dot: '#22c55e' };
    default:
      return { fill: '#0f172a', stroke: '#475569', text: 'text-slate-300', badge: 'bg-slate-800 text-slate-300 border-slate-700', dot: '#64748b' };
  }
}

interface NodeStyle {
  fill: string;
  stroke: string;
  text: string;
}

function getNodeStyle(type: string): NodeStyle {
  switch (type) {
    case 'attacker': return { fill: '#1a0505', stroke: '#dc2626', text: '#fca5a5' };
    case 'internet': return { fill: '#0c1a2e', stroke: '#3b82f6', text: '#93c5fd' };
    case 'waf': return { fill: '#0a1628', stroke: '#06b6d4', text: '#67e8f9' };
    default: return { fill: '#0f172a', stroke: '#64748b', text: '#94a3b8' };
  }
}

interface AnimatedPacketProps {
  pathId: string;
  color: string;
  duration: number;
  delay: number;
}

const AnimatedPacket: React.FC<AnimatedPacketProps> = ({ pathId, color, duration, delay }) => (
  <circle r="4" fill={color} opacity="0.9">
    <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`}>
      <mpath href={`#${pathId}`} />
    </animateMotion>
    <animate attributeName="opacity" values="0;1;1;0" dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} />
  </circle>
);

const STAGE_Y_OFFSETS = [12, 24, 36, 58, 70, 82];
const STAGE_X = 36;

export const KillChainView: React.FC = () => {
  const { killChainScenarios, activeScenarioId, setActiveScenarioId, addIPToBlacklist, addToast, setActiveTab } = useApp();

  const selectedScenario: KillChainAttackScenario =
    killChainScenarios.find((s) => s.id === activeScenarioId) || killChainScenarios[0];

  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(3);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    setSelectedStageIndex(3);
  }, [activeScenarioId]);

  const activeStage: KillChainStageDetail =
    selectedScenario.stages[selectedStageIndex] || selectedScenario.stages[0];

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to Clipboard', `Copied ${label} payload.`, 'info');
  }, [addToast]);

  const VW = 1000;
  const VH = 560;
  const px = (pct: number) => (pct / 100) * VW;
  const py = (pct: number) => (pct / 100) * VH;

  const blockedPhaseIndex = selectedScenario.blocked_at_phase - 1;

  const baseNodes = [
    { id: 'attacker', x: 6, y: 47, label: 'Threat Actor', sublabel: 'External', type: 'attacker', sym: '✕' },
    { id: 'internet', x: 21, y: 47, label: 'Internet', sublabel: 'Public Net', type: 'internet', sym: '⊕' },
    { id: 'waf', x: 52, y: 47, label: 'Coraza WAF', sublabel: 'Edge Enforcer', type: 'waf', sym: '⛨' },
    { id: 'app', x: 72, y: 32, label: 'App Server', sublabel: 'api.domain.com', type: 'target', sym: '●' },
    { id: 'auth', x: 72, y: 63, label: 'Auth Service', sublabel: 'OAuth2 / JWT', type: 'target', sym: '◈' },
    { id: 'db', x: 88, y: 47, label: 'Data Store', sublabel: 'PostgreSQL', type: 'target', sym: '◉' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Network className="w-6 h-6 text-rose-400" />
            API Cyber Kill Chain — Interactive Attack Map
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Live topology mapping of multi-stage API attack campaigns with Coraza WAF interception points
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-xl self-start">
          {killChainScenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeScenarioId === sc.id
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sc.title.split(' ')[0]} Campaign
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {selectedScenario.severity}
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300">{selectedScenario.owasp_api_category}</span>
            <span className="text-[10px] text-slate-500 font-mono">Attacker: {selectedScenario.attacker_profile}</span>
          </div>
          <h2 className="text-sm font-bold text-white">{selectedScenario.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{selectedScenario.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 font-mono">
            <span className="text-emerald-500 block text-[10px]">VERDICT</span>
            <span className="font-bold">BLOCKED AT PHASE {selectedScenario.blocked_at_phase}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 block text-[10px]">STATUS</span>
            <span className="text-emerald-400 font-bold">ZERO DATA BREACH</span>
          </div>
        </div>
      </div>

      {/* Map + Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* SVG Attack Map */}
        <div className="xl:col-span-3 rounded-2xl bg-[#060a12] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-white">Network Topology Attack Map</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLegend((v) => !v)}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showLegend ? 'Hide' : 'Show'} Legend
              </button>
              <span className="text-[10px] font-mono text-slate-500">MITRE ATT&amp;CK for API</span>
            </div>
          </div>

          <div className="relative w-full" style={{ aspectRatio: '1000/560' }}>
            <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full">
              <defs>
                <pattern id="kc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
                <filter id="kc-glow-cyan">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="kc-glow-red">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <marker id="kc-arr-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
                </marker>
                <marker id="kc-arr-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#06b6d4" />
                </marker>
                <marker id="kc-arr-slate" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
                </marker>
                <marker id="kc-arr-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
                </marker>

                {/* Animation paths */}
                <path id="kc-p-att" d={`M ${px(6)} ${py(47)} L ${px(21)} ${py(47)}`} fill="none" />
                {selectedScenario.stages.map((_, i) => (
                  <React.Fragment key={i}>
                    <path id={`kc-p-in${i}`} d={`M ${px(21)} ${py(47)} Q ${px(29)} ${py(STAGE_Y_OFFSETS[i] ?? 47)} ${px(STAGE_X)} ${py(STAGE_Y_OFFSETS[i] ?? 47)}`} fill="none" />
                    <path id={`kc-p-sw${i}`} d={`M ${px(STAGE_X)} ${py(STAGE_Y_OFFSETS[i] ?? 47)} Q ${px(44)} ${py(STAGE_Y_OFFSETS[i] ?? 47)} ${px(52)} ${py(47)}`} fill="none" />
                  </React.Fragment>
                ))}
                <path id="kc-p-wa" d={`M ${px(52)} ${py(47)} L ${px(72)} ${py(32)}`} fill="none" />
                <path id="kc-p-wb" d={`M ${px(52)} ${py(47)} L ${px(72)} ${py(63)}`} fill="none" />
                <path id="kc-p-ad" d={`M ${px(72)} ${py(32)} L ${px(88)} ${py(47)}`} fill="none" />
                <path id="kc-p-bd" d={`M ${px(72)} ${py(63)} L ${px(88)} ${py(47)}`} fill="none" />
              </defs>

              {/* Background */}
              <rect width={VW} height={VH} fill="url(#kc-grid)" opacity="0.7" />

              {/* Zone fills */}
              <rect x="0" y="0" width={px(14)} height={VH} fill="rgba(220,38,38,0.03)" />
              <rect x={px(29)} y="8" width={px(17)} height={VH - 16} fill="rgba(139,92,246,0.04)" rx="8" />
              <rect x={px(46)} y="0" width={px(54)} height={VH} fill="rgba(6,182,212,0.02)" />

              {/* Zone labels */}
              <text x={px(7)} y="16" textAnchor="middle" fontSize="8" fill="#ef4444" opacity="0.55" fontFamily="monospace" fontWeight="bold">EXTERNAL</text>
              <text x={px(37)} y="20" textAnchor="middle" fontSize="8" fill="#6d28d9" opacity="0.65" fontFamily="monospace" fontWeight="bold">KILL CHAIN STAGES</text>
              <text x={px(73)} y="16" textAnchor="middle" fontSize="8" fill="#06b6d4" opacity="0.45" fontFamily="monospace" fontWeight="bold">PROTECTED ZONE</text>

              {/* Attacker → Internet */}
              <line x1={px(6)} y1={py(47)} x2={px(21)} y2={py(47)} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.7" markerEnd="url(#kc-arr-red)" />

              {/* Internet → Stages */}
              {selectedScenario.stages.map((stage, i) => {
                const sc = getStatusColors(stage.status);
                const isActive = i === selectedStageIndex;
                return (
                  <path
                    key={`e-is-${i}`}
                    d={`M ${px(21)} ${py(47)} Q ${px(29)} ${py(STAGE_Y_OFFSETS[i] ?? 47)} ${px(STAGE_X - 3.5)} ${py(STAGE_Y_OFFSETS[i] ?? 47)}`}
                    fill="none"
                    stroke={sc.dot}
                    strokeWidth={isActive ? 1.8 : 0.7}
                    strokeDasharray="6,4"
                    opacity={isActive ? 0.9 : 0.3}
                    markerEnd={`url(#kc-arr-${stage.status === 'BLOCKED' ? 'red' : stage.status === 'DETECTED' ? 'amber' : 'slate'})`}
                  />
                );
              })}

              {/* Stages → WAF */}
              {selectedScenario.stages.map((stage, i) => {
                const sc = getStatusColors(stage.status);
                const isBlocked = i >= blockedPhaseIndex;
                const isActive = i === selectedStageIndex;
                return (
                  <path
                    key={`e-sw-${i}`}
                    d={`M ${px(STAGE_X + 3.5)} ${py(STAGE_Y_OFFSETS[i] ?? 47)} Q ${px(44)} ${py(STAGE_Y_OFFSETS[i] ?? 47)} ${px(52) - 30} ${py(47)}`}
                    fill="none"
                    stroke={isBlocked ? '#ef4444' : sc.dot}
                    strokeWidth={isActive ? 1.8 : 0.7}
                    strokeDasharray={isBlocked ? '3,3' : '6,4'}
                    opacity={isActive ? 0.9 : 0.25}
                    markerEnd={`url(#kc-arr-${isBlocked ? 'red' : 'slate'})`}
                  />
                );
              })}

              {/* WAF → App + Auth */}
              <line x1={px(52) + 30} y1={py(47)} x2={px(72) - 28} y2={py(32)} stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="8,4" opacity="0.6" markerEnd="url(#kc-arr-cyan)" />
              <line x1={px(52) + 30} y1={py(47)} x2={px(72) - 28} y2={py(63)} stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="8,4" opacity="0.6" markerEnd="url(#kc-arr-cyan)" />
              {/* App + Auth → DB */}
              <line x1={px(72) + 28} y1={py(32)} x2={px(88) - 24} y2={py(47)} stroke="#475569" strokeWidth="1" strokeDasharray="6,4" opacity="0.45" markerEnd="url(#kc-arr-slate)" />
              <line x1={px(72) + 28} y1={py(63)} x2={px(88) - 24} y2={py(47)} stroke="#475569" strokeWidth="1" strokeDasharray="6,4" opacity="0.45" markerEnd="url(#kc-arr-slate)" />

              {/* Animated Packets */}
              <AnimatedPacket pathId="kc-p-att" color="#ef4444" duration={1.8} delay={0} />
              <AnimatedPacket pathId="kc-p-att" color="#ef4444" duration={1.8} delay={0.7} />

              {selectedScenario.stages.map((stage, i) => {
                if (i !== selectedStageIndex) return null;
                const isBlocked = i >= blockedPhaseIndex;
                return (
                  <React.Fragment key={`pkt-${i}`}>
                    <AnimatedPacket pathId={`kc-p-in${i}`} color="#a855f7" duration={1.4} delay={0} />
                    <AnimatedPacket pathId={`kc-p-in${i}`} color="#a855f7" duration={1.4} delay={0.5} />
                    <AnimatedPacket pathId={`kc-p-sw${i}`} color={isBlocked ? '#ef4444' : '#f59e0b'} duration={1.2} delay={0.2} />
                    <AnimatedPacket pathId={`kc-p-sw${i}`} color={isBlocked ? '#ef4444' : '#f59e0b'} duration={1.2} delay={0.8} />
                  </React.Fragment>
                );
              })}

              {selectedStageIndex < blockedPhaseIndex && (
                <>
                  <AnimatedPacket pathId="kc-p-wa" color="#06b6d4" duration={1.5} delay={0.3} />
                  <AnimatedPacket pathId="kc-p-wb" color="#06b6d4" duration={1.5} delay={0.8} />
                </>
              )}

              {/* Base Nodes */}
              {baseNodes.map((node) => {
                const ns = getNodeStyle(node.type);
                const cx = px(node.x);
                const cy = py(node.y);
                const isWaf = node.id === 'waf';
                const r = isWaf ? 32 : 26;
                const isHov = hoveredNodeId === node.id;
                return (
                  <g key={node.id}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    <circle cx={cx} cy={cy} r={r + 9} fill="none" stroke={ns.stroke} strokeWidth={isHov ? 2 : 1} opacity={isHov ? 0.6 : 0.18} />
                    <circle cx={cx} cy={cy} r={r} fill={ns.fill} stroke={ns.stroke} strokeWidth={isWaf ? 2.5 : 1.5} filter={isWaf ? 'url(#kc-glow-cyan)' : undefined} />
                    <text x={cx} y={cy - 5} textAnchor="middle" fontSize={isWaf ? '14' : '12'} fill={ns.text} opacity="0.9">{node.sym}</text>
                    <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fill={ns.text} fontFamily="monospace" fontWeight="bold">{node.label}</text>
                    {node.sublabel && <text x={cx} y={cy + 18} textAnchor="middle" fontSize="7" fill={ns.text} fontFamily="monospace" opacity="0.55">{node.sublabel}</text>}
                    {isWaf && (
                      <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0">
                        <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="r" values={`${r + 10};${r + 22}`} dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Stage Nodes */}
              {selectedScenario.stages.map((stage, i) => {
                const sc = getStatusColors(stage.status);
                const cx = px(STAGE_X);
                const cy = py(STAGE_Y_OFFSETS[i] ?? 47);
                const isSel = i === selectedStageIndex;
                const isHov = hoveredNodeId === `stage-${i}`;
                const W = 132; const H = 56;
                return (
                  <g
                    key={`sn-${i}`}
                    onClick={() => setSelectedStageIndex(i)}
                    onMouseEnter={() => setHoveredNodeId(`stage-${i}`)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSel && <rect x={cx - W / 2 - 5} y={cy - H / 2 - 5} width={W + 10} height={H + 10} rx="12" fill="none" stroke={sc.dot} strokeWidth="1.5" opacity="0.55" />}
                    <rect x={cx - W / 2} y={cy - H / 2} width={W} height={H} rx="8" fill={isSel ? sc.fill : '#0d1320'} stroke={isSel || isHov ? sc.dot : '#1e293b'} strokeWidth={isSel ? 1.5 : 0.8} />
                    <circle cx={cx + W / 2 - 9} cy={cy - H / 2 + 9} r="4.5" fill={sc.dot}>
                      {isSel && <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" />}
                    </circle>
                    <text x={cx - W / 2 + 8} y={cy - H / 2 + 15} fontSize="7" fill={sc.dot} fontFamily="monospace" fontWeight="bold" opacity="0.85">
                      {`S0${stage.phase_number}: ${stage.phase}`}
                    </text>
                    <text x={cx} y={cy - H / 2 + 29} textAnchor="middle" fontSize="7.5" fill="#64748b" fontFamily="monospace">
                      {`${stage.http_method} ${stage.api_endpoint.split('/').slice(0, 4).join('/').slice(0, 22)}`}
                    </text>
                    <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9.5" fill={isSel ? '#f1f5f9' : '#94a3b8'} fontFamily="sans-serif" fontWeight="bold">
                      {stage.name.length > 16 ? stage.name.slice(0, 15) + '…' : stage.name}
                    </text>
                    <rect x={cx - 29} y={cy + 13} width="58" height="14" rx="4" fill={sc.dot} opacity="0.18" />
                    <text x={cx} y={cy + 22} textAnchor="middle" fontSize="7" fill={sc.dot} fontFamily="monospace" fontWeight="bold">{stage.status}</text>
                  </g>
                );
              })}

              {/* Vertical connectors between stage nodes */}
              {selectedScenario.stages.map((_, i) => {
                if (i >= selectedScenario.stages.length - 1) return null;
                const y1 = py(STAGE_Y_OFFSETS[i] ?? 0) + 29;
                const y2 = py(STAGE_Y_OFFSETS[i + 1] ?? 0) - 29;
                return <line key={`vc-${i}`} x1={px(STAGE_X)} y1={y1} x2={px(STAGE_X)} y2={y2} stroke="#1e293b" strokeWidth="1" strokeDasharray="4,3" />;
              })}

              {/* BLOCKED marker at WAF */}
              {blockedPhaseIndex >= 0 && blockedPhaseIndex < selectedScenario.stages.length && (
                <g filter="url(#kc-glow-red)">
                  <line x1={px(52) - 38} y1={py(47) - 22} x2={px(52) - 38} y2={py(47) + 22} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  <text x={px(52) - 38} y={py(47) + 35} textAnchor="middle" fontSize="7" fill="#ef4444" fontFamily="monospace" fontWeight="bold">BLOCKED</text>
                </g>
              )}
            </svg>

            {/* Legend */}
            {showLegend && (
              <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
                <p className="text-[9px] font-mono font-bold text-slate-400 mb-1.5 uppercase">Legend</p>
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#ef4444', label: 'Blocked / Denied' },
                    { color: '#f59e0b', label: 'Detected / Logged' },
                    { color: '#a855f7', label: 'Attempted' },
                    { color: '#22c55e', label: 'Neutralized' },
                    { color: '#06b6d4', label: 'WAF Protected Path' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                      <span className="text-[9px] font-mono text-slate-400">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stage quick-select */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1">
              {selectedScenario.stages.map((stage, i) => {
                const sc = getStatusColors(stage.status);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedStageIndex(i)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-mono transition-all border ${
                      i === selectedStageIndex ? 'border-slate-600 bg-slate-800' : 'border-transparent bg-slate-900/60 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.dot }} />
                    <span className={i === selectedStageIndex ? 'text-white' : 'text-slate-500'}>
                      P{stage.phase_number}: {stage.name.slice(0, 14)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* Stage Header */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusColors(activeStage.status).badge}`}>
                    {activeStage.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">PHASE {activeStage.phase_number}: {activeStage.phase}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{activeStage.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{activeStage.short_desc}</p>
              </div>
              <span className="shrink-0 ml-2 w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Activity className="w-4 h-4 text-cyan-400" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedStageIndex(Math.max(0, selectedStageIndex - 1))}
                disabled={selectedStageIndex === 0}
                className="flex-1 py-1.5 text-[11px] font-mono rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors text-slate-300"
              >
                ← Prev Stage
              </button>
              <span className="text-[10px] font-mono text-slate-500 px-1">{selectedStageIndex + 1}/{selectedScenario.stages.length}</span>
              <button
                onClick={() => setSelectedStageIndex(Math.min(selectedScenario.stages.length - 1, selectedStageIndex + 1))}
                disabled={selectedStageIndex === selectedScenario.stages.length - 1}
                className="flex-1 py-1.5 text-[11px] font-mono rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors text-slate-300"
              >
                Next Stage →
              </button>
            </div>
          </div>

          {/* Endpoint */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Target Endpoint</span>
              <span className="text-[10px] text-slate-500 font-mono">{activeStage.attacker_technique}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-cyan-300">{activeStage.http_method}</span>
              <span className="text-slate-200 truncate">{activeStage.api_endpoint}</span>
            </div>
          </div>

          {/* Payload */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-rose-400" /> Attack Payload
              </span>
              <button onClick={() => handleCopy(activeStage.sample_request, 'Request')} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono">
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-300 font-mono text-[10px] overflow-x-auto max-h-28 leading-relaxed">
              {activeStage.sample_request}
            </pre>
          </div>

          {/* WAF Detection */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> Coraza WAF Interception
            </h3>
            {activeStage.coraza_detection ? (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400">Rule #{activeStage.coraza_detection.rule_id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300">{activeStage.coraza_detection.action}</span>
                </div>
                <p className="text-slate-200 font-semibold text-[11px]">{activeStage.coraza_detection.rule_name}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block">ANOMALY SCORE</span>
                    <span className="text-rose-400 font-bold">+{activeStage.coraza_detection.anomaly_score}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">EVAL PHASE</span>
                    <span className="text-purple-300 font-bold">Phase {activeStage.coraza_detection.phase}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 text-center">
                <Clock className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
                <p>No blocking trigger at this preparatory phase.</p>
              </div>
            )}
          </div>

          {/* IoCs */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Indicators of Compromise (IoC)
            </span>
            <ul className="space-y-1.5">
              {activeStage.iocs.map((ioc, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-[10px]">
                  <span className="text-rose-400 shrink-0 font-mono">•</span>
                  <span className="font-mono text-slate-300">{ioc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Remediation */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> Remediation Guidance
            </div>
            <p className="text-[11px] text-emerald-300/90 leading-relaxed">{activeStage.remediation}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => addIPToBlacklist('185.220.101.5', `Blacklisted via Kill Chain Map: ${selectedScenario.title}`)}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 transition-colors flex items-center justify-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" /> Shun Adversary IP Across Fleet
            </button>
            <button
              onClick={() => setActiveTab('asm')}
              className="w-full py-2 px-3 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Inspect Target in ASM Module
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
