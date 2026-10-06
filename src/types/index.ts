export type NodeStatus = 'ONLINE' | 'WARN' | 'OFFLINE';
export type SyncStatus = 'IN_SYNC' | 'PENDING_UPDATE' | 'SYNCING';
export type EngineType = 'Caddy' | 'Envoy' | 'SPOA' | 'NGINX';

export interface CorazaNode {
  id: string;
  node_name: string;
  hostname: string;
  ip_address: string;
  status: NodeStatus;
  engine: EngineType;
  latency_ms: number;
  crs_version: string;
  sync_status: SyncStatus;
  config_version: string;
  cpu_usage: number;
  memory_usage: number;
  rps: number;
  last_heartbeat: string;
  mtls_status: 'VALID' | 'EXPIRING' | 'INVALID';
  region: string;
}

export interface SiteVHost {
  id: string;
  name: string;
  domain_name: string;
  paranoia_level: 1 | 2 | 3 | 4;
  inbound_threshold: number;
  outbound_threshold: number;
  active_rules_count: number;
  blocked_24h: number;
  status: 'ACTIVE' | 'MONITOR_ONLY' | 'DISABLED';
  created_at: string;
  node_count: number;
}

export interface CRSCategory {
  id: string;
  code_range: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  rules_count: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  sample_attacks: string[];
}

export interface CustomSecLangRule {
  id: string;
  rule_id: number;
  site_id: string; // or 'GLOBAL'
  name: string;
  seclang_raw: string;
  phase: number;
  action: 'deny' | 'allow' | 'log' | 'drop';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  match_target: string;
  operator: string;
  operator_param: string;
  status_code: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  tags: string[];
}

export interface AuditLogTransaction {
  id: string;
  timestamp: string;
  transaction_id: string;
  node_id: string;
  node_name: string;
  site_id: string;
  target_host: string;
  client_ip: string;
  client_country: string;
  client_country_code: string;
  client_asn: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  uri: string;
  http_version: string;
  response_status: number;
  action_taken: 'DENY' | 'LOG' | 'ALLOW';
  matched_rule_ids: number[];
  matched_messages: string[];
  matched_data: string[];
  matched_var_name: string;
  request_headers: Record<string, string>;
  request_body: string;
  latency_us: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RuleException {
  id: string;
  site_id: string;
  site_domain: string;
  rule_id: number;
  rule_name: string;
  path_pattern: string;
  parameter_name: string;
  reason: string;
  directive_type: 'SecRuleUpdateTargetById' | 'ctl:ruleRemoveById';
  generated_directive: string;
  created_by: string;
  created_at: string;
}

export interface IPReputationEntry {
  id: string;
  ip_cidr: string;
  type: 'ALLOWLIST' | 'BLOCKLIST';
  scope: 'GLOBAL' | string;
  reason: string;
  hits_count: number;
  added_by: string;
  added_at: string;
  expires_at: string | 'NEVER';
}

export interface ThreatFeed {
  id: string;
  name: string;
  provider: string;
  url: string;
  category: string;
  record_count: number;
  last_synced: string;
  auto_pull: boolean;
  status: 'ACTIVE' | 'SYNCING' | 'ERROR';
}

export type UserRole = 'ADMIN' | 'SECOPS_ANALYST' | 'SECURITY_ENGINEER' | 'DEVOPS_INFRA' | 'AUDITOR';

export interface UserPersona {
  id: string;
  name: string;
  role: UserRole;
  role_title: string;
  avatar_color: string;
  description: string;
  permissions: string[];
}

export interface SandboxTestResult {
  status: 'MATCHED' | 'PASSED';
  action: 'DENY' | 'ALLOW';
  status_code: number;
  triggered_rule_id?: number;
  rule_name?: string;
  matched_var?: string;
  matched_value?: string;
  anomaly_score_inbound: number;
  anomaly_score_threshold: number;
  evaluation_latency_ms: number;
  phase_evaluated: number;
  engine_verdict: string;
}

export interface AuditTrailEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  target_node_ip?: string;
  source_ip: string;
  details: string;
}

// ==========================================
// Module: Cyber Kill Chain for API Attacks
// ==========================================
export type KillChainPhase =
  | 'RECONNAISSANCE'
  | 'WEAPONIZATION'
  | 'DELIVERY'
  | 'EXPLOITATION'
  | 'PRIVILEGE_ESCALATION'
  | 'ACTIONS_ON_OBJECTIVES';

export interface KillChainStageDetail {
  phase: KillChainPhase;
  phase_number: number;
  name: string;
  short_desc: string;
  status: 'ATTEMPTED' | 'DETECTED' | 'BLOCKED' | 'NEUTRALIZED';
  attacker_technique: string;
  api_endpoint: string;
  http_method: string;
  sample_request: string;
  sample_response: string;
  coraza_detection?: {
    rule_id: number;
    rule_name: string;
    anomaly_score: number;
    action: 'DENY' | 'LOG' | 'RATE_LIMIT';
    phase: number;
  };
  iocs: string[];
  remediation: string;
}

export interface KillChainAttackScenario {
  id: string;
  title: string;
  owasp_api_category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  attacker_profile: string;
  target_service: string;
  detected_at: string;
  mitigation_status: 'CONTAINED_AND_BLOCKED' | 'AUTO_REMEDIATED' | 'INVESTIGATING';
  blocked_at_phase: number;
  stages: KillChainStageDetail[];
}

// ==========================================
// Module: Application Security Management (ASM)
// ==========================================
export type APISensitivity = 'CRITICAL_PII' | 'FINANCIAL' | 'AUTHENTICATION' | 'STANDARD' | 'PUBLIC';
export type APISchemaStatus = 'COMPLIANT' | 'DRIFT_DETECTED' | 'SHADOW_API' | 'ZOMBIE_API';

export interface DiscoveredAPIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  host: string;
  auth_type: 'JWT Bearer' | 'API Key' | 'Basic' | 'None (Unauthenticated)';
  status: APISchemaStatus;
  sensitivity: APISensitivity;
  rps: number;
  last_seen: string;
  parameters_detected: string[];
  schema_violations: number;
  is_quarantined: boolean;
}

export interface VulnerabilityCorrelation {
  cve_id: string;
  name: string;
  affected_component: string;
  cvss_score: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  coraza_mitigation_rule: number;
  coraza_rule_name: string;
  shield_status: 'ACTIVE_SHIELD' | 'MONITORING';
  attack_attempts_blocked_24h: number;
}

export interface ASMPostureSummary {
  overall_score: number;
  grade: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D';
  total_apis_discovered: number;
  shadow_apis_count: number;
  zombie_apis_count: number;
  schema_compliance_percent: number;
  runtime_cves_shielded: number;
  sensitive_data_leaks_prevented: number;
}

export interface DLPMaskingRule {
  id: string;
  pattern_name: string;
  data_type: 'CREDIT_CARD' | 'NATIONAL_ID_SSN' | 'JWT_SECRET' | 'PASSWORD' | 'BEARER_TOKEN';
  match_regex: string;
  mask_format: string;
  action: 'MASK_IN_LOGS' | 'DROP_HEADER' | 'BLOCK_REQUEST';
  hits_24h: number;
  is_enabled: boolean;
}

