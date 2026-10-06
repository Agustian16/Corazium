import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CorazaNode } from '../types';
import {
  Server,
  Plus,
  RefreshCw,
  Cpu,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Radio,
  ExternalLink,
  X,
  Layers,
} from 'lucide-react';

export const FleetView: React.FC = () => {
  const { nodes, registerNode, syncAllNodes, isSyncingNodes, currentUser } = useApp();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<CorazaNode | null>(null);

  // Form state for Register Node
  const [formData, setFormData] = useState<{
    node_name: string;
    hostname: string;
    ip_address: string;
    engine: CorazaNode['engine'];
    region: string;
  }>({
    node_name: 'edge-eu-caddy-01',
    hostname: 'eu-edge-caddy-01.infra.corp',
    ip_address: '10.30.1.25',
    engine: 'Caddy',
    region: 'eu-central-1 (Frankfurt)',
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerNode(formData);
    setIsRegisterModalOpen(false);
  };

  const healthyNodes = nodes.filter((n) => n.status === 'ONLINE').length;
  const inSyncNodes = nodes.filter((n) => n.sync_status === 'IN_SYNC').length;

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Server className="w-6 h-6 text-cyan-400" />
            Fleet Management & Node Control Plane
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Zero-downtime gRPC config distribution, health monitoring, and edge telemetry for Coraza nodes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={syncAllNodes}
            disabled={isSyncingNodes}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingNodes ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
            <span>{isSyncingNodes ? 'Broadcasting stream...' : 'Broadcast gRPC Sync'}</span>
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Register Edge Node</span>
          </button>
        </div>
      </div>

      {/* Fleet Health Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Cluster Health Status</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{healthyNodes} of {nodes.length} Operational</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            OPTIMAL
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Config Sync Status</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1 flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <span>{inSyncNodes} / {nodes.length} In-Sync</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            gRPC STREAM
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Target Evaluation Overhead</span>
            <div className="text-xl font-bold font-mono text-purple-300 mt-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span>&lt; 2.0 ms SLA</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
            NFR-1.1 MET
          </span>
        </div>
      </div>

      {/* Edge Nodes Table (FR-1.1, FR-1.2, FR-1.3) */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Registered Coraza Enforcer Nodes</h2>
            <p className="text-xs text-slate-400">Live telemetry reported via gRPC bidirectional stream</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-3">NODE NAME & HOST</th>
                <th className="pb-3">ENGINE / SPOA</th>
                <th className="pb-3">HEALTH</th>
                <th className="pb-3">WAF LATENCY</th>
                <th className="pb-3">RESOURCE USAGE</th>
                <th className="pb-3">CRS VERSION</th>
                <th className="pb-3">SYNC STATUS</th>
                <th className="pb-3 pr-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {nodes.map((node) => (
                <tr
                  key={node.id}
                  onClick={() => setSelectedNodeDetails(node)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* Node Name */}
                  <td className="py-3.5 pl-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-100 text-xs">{node.node_name}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{node.ip_address} • {node.hostname}</div>
                      </div>
                    </div>
                  </td>

                  {/* Engine */}
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                      {node.engine}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5">
                    {node.status === 'ONLINE' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ONLINE
                      </span>
                    ) : node.status === 'WARN' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        DEGRADED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        OFFLINE
                      </span>
                    )}
                  </td>

                  {/* Latency */}
                  <td className="py-3.5">
                    <span className={`font-bold ${node.latency_ms < 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {node.latency_ms} ms
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      {node.rps.toLocaleString()} req/s
                    </span>
                  </td>

                  {/* Resource Usage (CPU & RAM) */}
                  <td className="py-3.5 w-48">
                    <div className="space-y-1.5 font-sans">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>CPU: {node.cpu_usage}%</span>
                        <span>RAM: {node.memory_usage}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 flex overflow-hidden">
                        <div
                          className={`h-full ${node.cpu_usage > 70 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                          style={{ width: `${node.cpu_usage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* CRS Version */}
                  <td className="py-3.5 text-slate-300">
                    <span className="text-[11px] font-mono">{node.crs_version}</span>
                  </td>

                  {/* Sync Status */}
                  <td className="py-3.5">
                    {node.sync_status === 'IN_SYNC' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        IN_SYNC ({node.config_version})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                        PENDING_UPDATE
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pr-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeDetails(node);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-sans"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Node Details Modal */}
      {selectedNodeDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedNodeDetails.node_name}
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/20 text-cyan-300">
                      {selectedNodeDetails.engine}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {selectedNodeDetails.ip_address} • {selectedNodeDetails.region}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNodeDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Latency</span>
                <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                  {selectedNodeDetails.latency_ms} ms
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Traffic RPS</span>
                <div className="text-base font-bold font-mono text-white mt-1">
                  {selectedNodeDetails.rps} req/s
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Sync Version</span>
                <div className="text-base font-bold font-mono text-cyan-400 mt-1">
                  {selectedNodeDetails.config_version}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">mTLS Status</span>
                <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                  {selectedNodeDetails.mtls_status}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                Live gRPC Stream Telemetry Channel
              </span>
              <div className="font-mono text-xs text-slate-400 space-y-1 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
                <div className="text-emerald-400">[CONNECTED] gRPC Bidirectional Stream active over mTLS port 9443</div>
                <div>[HEARTBEAT] ping ack received in 1.2ms (last: {selectedNodeDetails.last_heartbeat})</div>
                <div>[POLICY_HASH] sha256:7f9a2e8c1b4d0092... loaded in Coraza engine memory</div>
                <div>[CORAZA_RULES] Active rules: 184 CRS rules, 4 custom SecLang rules</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedNodeDetails(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  syncAllNodes();
                  setSelectedNodeDetails(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                Trigger Config Reload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Node Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <form
            onSubmit={handleRegisterSubmit}
            className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  Enroll New Coraza Enforcer Node
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect a Caddy, Envoy, or SPOA reverse proxy running OWASP Coraza v3
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Node Identifier Name</label>
                <input
                  type="text"
                  required
                  value={formData.node_name}
                  onChange={(e) => setFormData({ ...formData, node_name: e.target.value })}
                  placeholder="e.g. edge-eu-caddy-01"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Reverse Proxy Engine</label>
                  <select
                    value={formData.engine}
                    onChange={(e) => setFormData({ ...formData, engine: e.target.value as CorazaNode['engine'] })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Caddy">Caddy (Coraza Plugin)</option>
                    <option value="Envoy">Envoy Proxy (Wasm/gRPC)</option>
                    <option value="SPOA">HAProxy SPOA</option>
                    <option value="NGINX">NGINX Connector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Region</label>
                  <input
                    type="text"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">IP Address</label>
                  <input
                    type="text"
                    required
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    placeholder="10.10.x.x"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Internal Hostname</label>
                  <input
                    type="text"
                    required
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    placeholder="edge.corp"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200">
                <div className="font-semibold mb-0.5">mTLS Security (NFR-2.1)</div>
                Control Plane will issue an x509 client certificate for mutual TLS authentication.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
              >
                Enroll & Issue Certificate
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
