import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CorazaNode,
  SiteVHost,
  CRSCategory,
  CustomSecLangRule,
  AuditLogTransaction,
  RuleException,
  IPReputationEntry,
  ThreatFeed,
  UserPersona,
  AuditTrailEvent,
  SandboxTestResult,
  KillChainAttackScenario,
  DiscoveredAPIEndpoint,
  VulnerabilityCorrelation,
  ASMPostureSummary,
  DLPMaskingRule,
} from '../types';
import {
  INITIAL_NODES,
  INITIAL_SITES,
  INITIAL_CRS_CATEGORIES,
  INITIAL_CUSTOM_RULES,
  INITIAL_AUDIT_LOGS,
  INITIAL_EXCEPTIONS,
  INITIAL_IP_ENTRIES,
  INITIAL_THREAT_FEEDS,
  USER_PERSONAS,
  INITIAL_AUDIT_TRAIL,
  INITIAL_KILL_CHAIN_SCENARIOS,
  INITIAL_ASM_POSTURE,
  INITIAL_DISCOVERED_APIS,
  INITIAL_CVE_CORRELATIONS,
  INITIAL_DLP_RULES,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
}

interface AppContextType {
  currentSiteId: string;
  setCurrentSiteId: (siteId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserPersona;
  setCurrentUser: (persona: UserPersona) => void;
  nodes: CorazaNode[];
  sites: SiteVHost[];
  crsCategories: CRSCategory[];
  customRules: CustomSecLangRule[];
  logs: AuditLogTransaction[];
  exceptions: RuleException[];
  ipEntries: IPReputationEntry[];
  threatFeeds: ThreatFeed[];
  auditTrail: AuditTrailEvent[];
  isLiveStreaming: boolean;
  setIsLiveStreaming: (val: boolean) => void;
  selectedLogForModal: AuditLogTransaction | null;
  setSelectedLogForModal: (log: AuditLogTransaction | null) => void;
  isSyncingNodes: boolean;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Cyber Kill Chain state
  killChainScenarios: KillChainAttackScenario[];
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;

  // Application Security Management (ASM) state
  asmPosture: ASMPostureSummary;
  discoveredApis: DiscoveredAPIEndpoint[];
  cveCorrelations: VulnerabilityCorrelation[];
  dlpRules: DLPMaskingRule[];
  toggleApiQuarantine: (apiId: string) => void;
  toggleDlpRule: (ruleId: string) => void;
  enforceOpenApiSchema: () => void;

  // Domain Actions
  syncAllNodes: () => Promise<void>;
  registerNode: (node: { node_name: string; hostname: string; ip_address: string; engine: CorazaNode['engine']; region: string }) => void;
  toggleCRSCategory: (categoryId: string) => void;
  updateSiteSettings: (siteId: string, paranoiaLevel: 1 | 2 | 3 | 4, inbound: number, outbound: number) => void;
  saveCustomRule: (rule: Partial<CustomSecLangRule>) => void;
  toggleRuleActive: (ruleId: number) => void;
  deleteCustomRule: (ruleId: number) => void;
  createOneClickException: (params: { site_id: string; rule_id: number; rule_name: string; path_pattern: string; parameter_name: string; reason: string }) => void;
  deleteException: (exceptionId: string) => void;
  addIPToBlacklist: (ipOrCidr: string, reason: string, scope?: string) => void;
  removeIPEntry: (id: string) => void;
  syncThreatFeedNow: (feedId: string) => void;
  runSandboxTest: (req: { method: string; uri: string; headers: Record<string, string>; body: string }) => SandboxTestResult;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSiteId, setCurrentSiteId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentUser, setCurrentUser] = useState<UserPersona>(USER_PERSONAS[0]); // Default to Ahmad (SecOps)
  const [nodes, setNodes] = useState<CorazaNode[]>(INITIAL_NODES);
  const [sites, setSites] = useState<SiteVHost[]>(INITIAL_SITES);
  const [crsCategories, setCrsCategories] = useState<CRSCategory[]>(INITIAL_CRS_CATEGORIES);
  const [customRules, setCustomRules] = useState<CustomSecLangRule[]>(INITIAL_CUSTOM_RULES);
  const [logs, setLogs] = useState<AuditLogTransaction[]>(INITIAL_AUDIT_LOGS);
  const [exceptions, setExceptions] = useState<RuleException[]>(INITIAL_EXCEPTIONS);
  const [ipEntries, setIpEntries] = useState<IPReputationEntry[]>(INITIAL_IP_ENTRIES);
  const [threatFeeds, setThreatFeeds] = useState<ThreatFeed[]>(INITIAL_THREAT_FEEDS);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEvent[]>(INITIAL_AUDIT_TRAIL);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [selectedLogForModal, setSelectedLogForModal] = useState<AuditLogTransaction | null>(null);
  const [isSyncingNodes, setIsSyncingNodes] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Cyber Kill Chain state
  const [killChainScenarios, setKillChainScenarios] = useState<KillChainAttackScenario[]>(INITIAL_KILL_CHAIN_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-bola-01');

  // Application Security Management (ASM) state
  const [asmPosture, setAsmPosture] = useState<ASMPostureSummary>(INITIAL_ASM_POSTURE);
  const [discoveredApis, setDiscoveredApis] = useState<DiscoveredAPIEndpoint[]>(INITIAL_DISCOVERED_APIS);
  const [cveCorrelations, setCveCorrelations] = useState<VulnerabilityCorrelation[]>(INITIAL_CVE_CORRELATIONS);
  const [dlpRules, setDlpRules] = useState<DLPMaskingRule[]>(INITIAL_DLP_RULES);

  const toggleApiQuarantine = (apiId: string) => {
    setDiscoveredApis((prev) =>
      prev.map((api) => {
        if (api.id === apiId) {
          const nextState = !api.is_quarantined;
          addToast(
            nextState ? 'API Quarantined' : 'API Quarantine Lifted',
            `Endpoint ${api.path} is now ${nextState ? 'QUARANTINED (Drop all traffic in Coraza)' : 'RESTORED'}.`,
            nextState ? 'warning' : 'info'
          );
          return { ...api, is_quarantined: nextState };
        }
        return api;
      })
    );
  };

  const toggleDlpRule = (ruleId: string) => {
    setDlpRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const nextState = !r.is_enabled;
          addToast(
            nextState ? 'DLP Masking Enabled' : 'DLP Masking Muted',
            `${r.pattern_name} is now ${nextState ? 'ACTIVE' : 'MUTED'}.`,
            nextState ? 'info' : 'warning'
          );
          return { ...r, is_enabled: nextState };
        }
        return r;
      })
    );
  };

  const enforceOpenApiSchema = () => {
    addToast(
      'OpenAPI Schema Enforced',
      'Strict parameter typing & schema validation compiled into Coraza reverse proxy runtime. Extra undocumented arguments blocked.',
      'success'
    );
  };

  const addToast = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type, timestamp: new Date() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Simulated live event generator when live streaming is enabled
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // 30% chance to generate a live log every 5 seconds to simulate real-world attack stream
      if (Math.random() > 0.4) {
        const attackVectors = [
          {
            uri: '/api/v1/auth/token?code=' + encodeURIComponent("' UNION SELECT username,password FROM users--"),
            rule_id: 942100,
            msg: 'SQL Injection Attack Detected via libinjection',
            var: 'ARGS:code',
            val: "' UNION SELECT username,password FROM users--",
            action: 'DENY' as const,
            code: 403,
            method: 'POST' as const,
            ip: `185.220.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            country: 'Russia',
            country_code: 'RU',
            asn: 'AS13335 (Tor Network)',
            severity: 'CRITICAL' as const,
            host: 'api.domain.com',
            site: 'site-api',
          },
          {
            uri: '/search?query=' + encodeURIComponent('<img src=x onerror=alert(document.cookie)>'),
            rule_id: 941100,
            msg: 'XSS Attack Detected via libinjection',
            var: 'ARGS:query',
            val: '<img src=x onerror=alert(document.cookie)>',
            action: 'DENY' as const,
            code: 403,
            method: 'GET' as const,
            ip: `103.21.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            country: 'Singapore',
            country_code: 'SG',
            asn: 'AS132203 (Cloud Vendor)',
            severity: 'HIGH' as const,
            host: 'shop.domain.com',
            site: 'site-shop',
          },
          {
            uri: '/.env',
            rule_id: 930100,
            msg: 'Sensitive Configuration File Access (.env / credentials)',
            var: 'REQUEST_URI',
            val: '/.env',
            action: 'DENY' as const,
            code: 403,
            method: 'GET' as const,
            ip: `198.51.100.${Math.floor(Math.random() * 255)}`,
            country: 'United States',
            country_code: 'US',
            asn: 'AS14061 (DigitalOcean)',
            severity: 'HIGH' as const,
            host: 'api.domain.com',
            site: 'site-api',
          },
          {
            uri: '/api/v1/health',
            rule_id: 0,
            msg: '',
            var: '',
            val: '',
            action: 'ALLOW' as const,
            code: 200,
            method: 'GET' as const,
            ip: '10.10.1.1',
            country: 'Internal',
            country_code: 'INT',
            asn: 'Internal VPC Gateway',
            severity: 'LOW' as const,
            host: 'api.domain.com',
            site: 'site-api',
          },
        ];

        const randomAttack = attackVectors[Math.floor(Math.random() * attackVectors.length)];
        const newLog: AuditLogTransaction = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          transaction_id: `tx_${Math.random().toString(36).substring(2, 10)}`,
          node_id: 'node-caddy-sg-01',
          node_name: 'edge-sg-caddy-01',
          site_id: randomAttack.site,
          target_host: randomAttack.host,
          client_ip: randomAttack.ip,
          client_country: randomAttack.country,
          client_country_code: randomAttack.country_code,
          client_asn: randomAttack.asn,
          http_method: randomAttack.method,
          uri: randomAttack.uri,
          http_version: 'HTTP/2.0',
          response_status: randomAttack.code,
          action_taken: randomAttack.action,
          matched_rule_ids: randomAttack.rule_id ? [randomAttack.rule_id] : [],
          matched_messages: randomAttack.msg ? [randomAttack.msg] : [],
          matched_data: randomAttack.val ? [randomAttack.val] : [],
          matched_var_name: randomAttack.var,
          request_headers: {
            Host: randomAttack.host,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: '*/*',
            'X-Forwarded-For': randomAttack.ip,
          },
          request_body: randomAttack.method === 'POST' ? `{"payload": "${randomAttack.val}"}` : '',
          latency_us: Math.floor(Math.random() * 800) + 650,
          severity: randomAttack.severity,
        };

        setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // keep latest 50
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Sync All Nodes via gRPC (Sub-1s sync per PRD NFR-1.2)
  const syncAllNodes = async () => {
    setIsSyncingNodes(true);
    addToast('gRPC Config Broadcast', 'Broadcasting latest SecLang rules & policies to 4 edge nodes...', 'info');

    // Simulate gRPC stream distribution
    await new Promise((r) => setTimeout(r, 650));

    const newVersion = `v${Math.floor(Math.random() * 50) + 105}`;
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        sync_status: 'IN_SYNC',
        config_version: newVersion,
        status: 'ONLINE',
        last_heartbeat: 'Just now',
      }))
    );

    const auditEvent: AuditTrailEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${currentUser.name} (${currentUser.role_title})`,
      action: 'GRPC_CONFIG_BROADCAST',
      entity_type: 'Fleet',
      entity_id: newVersion,
      source_ip: '10.10.99.1',
      details: `Hot-reloaded SecLang rule bundle to all nodes via gRPC stream without proxy restart. Config version: ${newVersion}.`,
    };
    setAuditTrail((prev) => [auditEvent, ...prev]);

    setIsSyncingNodes(false);
    addToast('Configuration Synchronized', `gRPC Stream completed in 650ms. All nodes in sync on ${newVersion}. Zero downtime.`, 'success');
  };

  const registerNode = (nodeData: {
    node_name: string;
    hostname: string;
    ip_address: string;
    engine: CorazaNode['engine'];
    region: string;
  }) => {
    const newNode: CorazaNode = {
      id: `node-${Date.now()}`,
      node_name: nodeData.node_name,
      hostname: nodeData.hostname,
      ip_address: nodeData.ip_address,
      engine: nodeData.engine,
      status: 'ONLINE',
      latency_ms: +(Math.random() * 0.8 + 1.0).toFixed(2),
      crs_version: 'CRS v4.0.0',
      sync_status: 'IN_SYNC',
      config_version: 'v104',
      cpu_usage: 24,
      memory_usage: 32,
      rps: 450,
      last_heartbeat: 'Just now',
      mtls_status: 'VALID',
      region: nodeData.region,
    };

    setNodes((prev) => [...prev, newNode]);

    const auditEvent: AuditTrailEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${currentUser.name} (${currentUser.role_title})`,
      action: 'NODE_REGISTERED',
      entity_type: 'CorazaNode',
      entity_id: newNode.id,
      target_node_ip: newNode.ip_address,
      source_ip: '10.10.99.1',
      details: `Enrolled new Coraza Enforcer node ${newNode.node_name} with mTLS certificate authentication.`,
    };
    setAuditTrail((prev) => [auditEvent, ...prev]);
    addToast('Node Registered', `Node ${newNode.node_name} (${newNode.engine}) successfully connected to Control Plane.`, 'success');
  };

  const toggleCRSCategory = (categoryId: string) => {
    setCrsCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const nextState = !cat.enabled;
          addToast(
            nextState ? 'CRS Category Enabled' : 'CRS Category Disabled',
            `${cat.name} (${cat.code_range}) is now ${nextState ? 'ACTIVE' : 'MUTED'}. Changes queued for gRPC push.`,
            nextState ? 'info' : 'warning'
          );
          return { ...cat, enabled: nextState };
        }
        return cat;
      })
    );
  };

  const updateSiteSettings = (siteId: string, paranoiaLevel: 1 | 2 | 3 | 4, inbound: number, outbound: number) => {
    setSites((prev) =>
      prev.map((site) => {
        if (site.id === siteId) {
          return {
            ...site,
            paranoia_level: paranoiaLevel,
            inbound_threshold: inbound,
            outbound_threshold: outbound,
          };
        }
        return site;
      })
    );

    const auditEvent: AuditTrailEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${currentUser.name} (${currentUser.role_title})`,
      action: 'SITE_SECURITY_POLICY_UPDATE',
      entity_type: 'SiteVHost',
      entity_id: siteId,
      source_ip: '10.10.99.1',
      details: `Updated Paranoia Level to PL ${paranoiaLevel}, Inbound Threshold to ${inbound}, Outbound Threshold to ${outbound}.`,
    };
    setAuditTrail((prev) => [auditEvent, ...prev]);
    addToast('Security Policy Updated', `Updated site settings: Paranoia Level PL ${paranoiaLevel}, Anomaly Threshold: ${inbound}.`, 'success');
  };

  const saveCustomRule = (ruleData: Partial<CustomSecLangRule>) => {
    if (ruleData.id) {
      setCustomRules((prev) => prev.map((r) => (r.id === ruleData.id ? ({ ...r, ...ruleData } as CustomSecLangRule) : r)));
      addToast('Rule Updated', `Custom SecLang rule ${ruleData.rule_id} updated successfully.`, 'success');
    } else {
      const newRule: CustomSecLangRule = {
        id: `rule-${Date.now()}`,
        rule_id: ruleData.rule_id || Math.floor(Math.random() * 89999) + 900000,
        site_id: ruleData.site_id || 'GLOBAL',
        name: ruleData.name || 'Custom SecLang Rule',
        seclang_raw: ruleData.seclang_raw || '',
        phase: ruleData.phase || 2,
        action: ruleData.action || 'deny',
        severity: ruleData.severity || 'HIGH',
        match_target: ruleData.match_target || 'ARGS',
        operator: ruleData.operator || '@rx',
        operator_param: ruleData.operator_param || '',
        status_code: ruleData.status_code || 403,
        is_active: true,
        created_by: `${currentUser.name} (${currentUser.role_title})`,
        created_at: new Date().toISOString(),
        tags: ruleData.tags || ['custom'],
      };
      setCustomRules((prev) => [newRule, ...prev]);

      const auditEvent: AuditTrailEvent = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: `${currentUser.name} (${currentUser.role_title})`,
        action: 'CUSTOM_RULE_CREATED',
        entity_type: 'CustomRule',
        entity_id: String(newRule.rule_id),
        source_ip: '10.10.99.1',
        details: `Published custom SecLang rule #${newRule.rule_id}: "${newRule.name}". Phase: ${newRule.phase}, Action: ${newRule.action}.`,
      };
      setAuditTrail((prev) => [auditEvent, ...prev]);
      addToast('Rule Created', `SecLang Rule #${newRule.rule_id} compiled with 0 syntax errors.`, 'success');
    }
  };

  const toggleRuleActive = (ruleId: number) => {
    setCustomRules((prev) =>
      prev.map((r) => {
        if (r.rule_id === ruleId) {
          const newState = !r.is_active;
          addToast(
            newState ? 'Rule Activated' : 'Rule Muted',
            `Rule #${ruleId} is now ${newState ? 'ACTIVE' : 'INACTIVE'}.`,
            newState ? 'info' : 'warning'
          );
          return { ...r, is_active: newState };
        }
        return r;
      })
    );
  };

  const deleteCustomRule = (ruleId: number) => {
    setCustomRules((prev) => prev.filter((r) => r.rule_id !== ruleId));
    addToast('Rule Deleted', `SecLang Rule #${ruleId} removed from repository.`, 'info');
  };

  // One-Click False Positive Exception (PRD Section 4.3 FR-3.3)
  const createOneClickException = ({
    site_id,
    rule_id,
    rule_name,
    path_pattern,
    parameter_name,
    reason,
  }: {
    site_id: string;
    rule_id: number;
    rule_name: string;
    path_pattern: string;
    parameter_name: string;
    reason: string;
  }) => {
    const siteObj = sites.find((s) => s.id === site_id);
    const generatedDirective = parameter_name
      ? `SecRuleUpdateTargetById ${rule_id} "!${parameter_name}"`
      : `ctl:ruleRemoveById=${rule_id}`;

    const newException: RuleException = {
      id: `exc-${Date.now()}`,
      site_id,
      site_domain: siteObj ? siteObj.domain_name : 'api.domain.com',
      rule_id,
      rule_name,
      path_pattern,
      parameter_name,
      reason,
      directive_type: parameter_name ? 'SecRuleUpdateTargetById' : 'ctl:ruleRemoveById',
      generated_directive: generatedDirective,
      created_by: `${currentUser.name} (${currentUser.role_title})`,
      created_at: new Date().toISOString(),
    };

    setExceptions((prev) => [newException, ...prev]);

    const auditEvent: AuditTrailEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${currentUser.name} (${currentUser.role_title})`,
      action: 'RULE_EXCEPTION_CREATED',
      entity_type: 'RuleException',
      entity_id: String(rule_id),
      source_ip: '10.10.99.1',
      details: `Generated 1-Click SecLang Exception for Rule #${rule_id} on path "${path_pattern}" (${generatedDirective}).`,
    };
    setAuditTrail((prev) => [auditEvent, ...prev]);

    addToast(
      'One-Click Exception Deployed',
      `Auto-generated: ${generatedDirective} for endpoint ${path_pattern}. MTTR reduced to < 2 minutes!`,
      'success'
    );
  };

  const deleteException = (exceptionId: string) => {
    setExceptions((prev) => prev.filter((e) => e.id !== exceptionId));
    addToast('Exception Revoked', 'Rule exclusion reverted. Coraza engine will resume normal inspection on this target.', 'info');
  };

  const addIPToBlacklist = (ipOrCidr: string, reason: string, scope = 'GLOBAL') => {
    const newEntry: IPReputationEntry = {
      id: `ip-${Date.now()}`,
      ip_cidr: ipOrCidr.includes('/') ? ipOrCidr : `${ipOrCidr}/32`,
      type: 'BLOCKLIST',
      scope,
      reason,
      hits_count: 1,
      added_by: `${currentUser.name} (${currentUser.role_title})`,
      added_at: new Date().toISOString(),
      expires_at: 'NEVER',
    };

    setIpEntries((prev) => [newEntry, ...prev]);

    const auditEvent: AuditTrailEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${currentUser.name} (${currentUser.role_title})`,
      action: 'IP_BLOCKLISTED',
      entity_type: 'IPReputation',
      entity_id: newEntry.ip_cidr,
      source_ip: '10.10.99.1',
      details: `Added ${newEntry.ip_cidr} to ${scope} Blocklist. Reason: "${reason}".`,
    };
    setAuditTrail((prev) => [auditEvent, ...prev]);
    addToast('IP Added to Blocklist', `${newEntry.ip_cidr} instantly blocked across Coraza edge nodes.`, 'warning');
  };

  const removeIPEntry = (id: string) => {
    setIpEntries((prev) => prev.filter((ip) => ip.id !== id));
    addToast('IP Entry Removed', 'IP rule removed from active access list.', 'info');
  };

  const syncThreatFeedNow = (feedId: string) => {
    setThreatFeeds((prev) =>
      prev.map((feed) => {
        if (feed.id === feedId) {
          return {
            ...feed,
            last_synced: 'Just now',
            record_count: feed.record_count + Math.floor(Math.random() * 50) + 10,
          };
        }
        return feed;
      })
    );
    addToast('Threat Feed Synchronized', 'Downloaded latest IP threat indicators into Coraza in-memory lookup cache.', 'success');
  };

  // Dry-Run Testing Sandbox Engine (PRD Section 4.2 FR-2.4 Go FTW integration)
  const runSandboxTest = (req: {
    method: string;
    uri: string;
    headers: Record<string, string>;
    body: string;
  }): SandboxTestResult => {
    const fullTarget = `${req.method} ${req.uri} ${req.body} ${JSON.stringify(req.headers)}`.toLowerCase();

    // Check for SQLi patterns
    if (fullTarget.includes('union') && fullTarget.includes('select')) {
      return {
        status: 'MATCHED',
        action: 'DENY',
        status_code: 403,
        triggered_rule_id: 942100,
        rule_name: 'SQL Injection Attack Detected via libinjection (CRS v4)',
        matched_var: 'ARGS / REQUEST_BODY',
        matched_value: 'union select',
        anomaly_score_inbound: 5,
        anomaly_score_threshold: 5,
        evaluation_latency_ms: 0.84,
        phase_evaluated: 2,
        engine_verdict: 'BLOCKED: Inbound Anomaly Score (5) reached Threshold (5). Request dropped.',
      };
    }

    // Check for XSS patterns
    if (fullTarget.includes('<script') || fullTarget.includes('onerror=') || fullTarget.includes('javascript:')) {
      return {
        status: 'MATCHED',
        action: 'DENY',
        status_code: 403,
        triggered_rule_id: 941100,
        rule_name: 'XSS Attack Detected via libinjection (CRS v4)',
        matched_var: 'ARGS:query',
        matched_value: '<script> or event handler',
        anomaly_score_inbound: 5,
        anomaly_score_threshold: 5,
        evaluation_latency_ms: 0.72,
        phase_evaluated: 2,
        engine_verdict: 'BLOCKED: Cross-Site Scripting signature matched. Request rejected.',
      };
    }

    // Check for Log4j JNDI pattern
    if (fullTarget.includes('${jndi:') || fullTarget.includes('ldap://')) {
      return {
        status: 'MATCHED',
        action: 'DENY',
        status_code: 403,
        triggered_rule_id: 900003,
        rule_name: 'Zero-Day Log4j CVE-2021-44228 JNDI Injection Exploit Attempt',
        matched_var: 'REQUEST_HEADERS:User-Agent',
        matched_value: '${jndi:ldap:...}',
        anomaly_score_inbound: 10,
        anomaly_score_threshold: 5,
        evaluation_latency_ms: 0.91,
        phase_evaluated: 1,
        engine_verdict: 'BLOCKED: Critical RCE deserialization pattern detected in request headers.',
      };
    }

    // Check for Path Traversal
    if (fullTarget.includes('../') || fullTarget.includes('..\\') || fullTarget.includes('/etc/passwd')) {
      return {
        status: 'MATCHED',
        action: 'DENY',
        status_code: 403,
        triggered_rule_id: 930100,
        rule_name: 'Local File Inclusion / Path Traversal Attack',
        matched_var: 'REQUEST_URI',
        matched_value: '../ directory traversal sequence',
        anomaly_score_inbound: 5,
        anomaly_score_threshold: 5,
        evaluation_latency_ms: 0.65,
        phase_evaluated: 1,
        engine_verdict: 'BLOCKED: Path traversal attempt prevented by CRS Rule 930100.',
      };
    }

    // Default: Clean Request PASSED
    return {
      status: 'PASSED',
      action: 'ALLOW',
      status_code: 200,
      anomaly_score_inbound: 0,
      anomaly_score_threshold: 5,
      evaluation_latency_ms: 0.42,
      phase_evaluated: 2,
      engine_verdict: 'PASSED: No malicious patterns or anomaly thresholds triggered. Request forwarded to upstream.',
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentSiteId,
        setCurrentSiteId,
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        nodes,
        sites,
        crsCategories,
        customRules,
        logs,
        exceptions,
        ipEntries,
        threatFeeds,
        auditTrail,
        isLiveStreaming,
        setIsLiveStreaming,
        selectedLogForModal,
        setSelectedLogForModal,
        isSyncingNodes,
        toasts,
        addToast,
        removeToast,
        syncAllNodes,
        registerNode,
        toggleCRSCategory,
        updateSiteSettings,
        saveCustomRule,
        toggleRuleActive,
        deleteCustomRule,
        createOneClickException,
        deleteException,
        addIPToBlacklist,
        removeIPEntry,
        syncThreatFeedNow,
        runSandboxTest,
        killChainScenarios,
        activeScenarioId,
        setActiveScenarioId,
        asmPosture,
        discoveredApis,
        cveCorrelations,
        dlpRules,
        toggleApiQuarantine,
        toggleDlpRule,
        enforceOpenApiSchema,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
