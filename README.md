# Coraza Console — Modern Enterprise WAAP Control Plane & Dashboard

Frontend Web Application & Control Plane untuk **OWASP Coraza WAF Engine (v3.x+)** dan **OWASP Core Rule Set (CRS v4)**, dibangun sesuai spesifikasi dokumen [Product Requirement Document (PRD)](file:///g:/AI-DEV/Project/WAAP/Coraza_WAF_Management_Dashboard_PRD.md).

---

## 🚀 Fitur Unggulan Sesuai Dokumen PRD

### 1. Module 1: Fleet Management & Node Control Plane (FR-1.1 s/d FR-1.3)
- **Node Discovery & Enforcer Fleet:** Menampilkan node Caddy, Envoy, dan HAProxy SPOA dengan IP Address, Hostname, status online/offline, dan versi CRS.
- **Health & Performance Telemetry:** Pemantauan real-time CPU %, RAM %, RPS, dan WAF Latency (< 2ms SLA meter compliant NFR-1.1).
- **Zero-Downtime gRPC Config Stream:** Tombol *Broadcast gRPC Sync* untuk melakukan hot-reload rule SecLang secara stream (< 1 detik distribusi tanpa restart proxy reverse proxy).
- **Node Registration Modal:** Pendaftaran node baru dengan sertifikat mTLS (NFR-2.1).

### 2. Module 2: OWASP CRS & SecLang Rule Management Engine (FR-2.1 s/d FR-2.4)
- **OWASP CRS v4 Visual Switch:** Sakelar on/off untuk kategori serangan CRS (SQLi `942xxx`, XSS `941xxx`, RCE `932xxx`, Protocol `920xxx`, LFI `930xxx`, RFI `931xxx`, PHP `933xxx`, Session `943xxx`, Scanners `913xxx`, Request Smuggling `921xxx`).
- **Paranoia Level Slider:** Kalibrasi visual Paranoia Level (PL 1 - PL 4) per Virtual Host.
- **Anomaly Score Thresholds:** Form slider skor anomali inbound (default: 5) dan outbound (default: 4).
- **Dual-Mode Rule Editor:**
  - **Visual Builder:** Pembuatan rule interaktif berbasis formulir (Target, Operator `@rx`, Action `deny`, Phase 1-4, Severity).
  - **Monaco SecLang Code Editor:** Editor kode bertema gelap dengan syntax highlighting, nomor baris, dan status linter *Syntax Validated (0 Errors, 0 Warnings)*.

### 3. Module 2.4: Testing Sandbox / Dry-Run Engine (Go FTW Integration)
- **Payload Testing Sandbox:** Pengujian HTTP request secara live terhadap Coraza runtime engine sebelum rule diterbitkan.
- **Preset Serangan Siap Pakai:** SQLi Union Select, XSS Stored Script, Log4j CVE-2021-44228 JNDI, Path Traversal `/etc/passwd`, dan Clean Benign Traffic.
- **Diagnostik Engine:** Menghitung akurasi verdict (`BLOCKED (HTTP 403)` atau `PASSED (HTTP 200)`), Rule ID yang terpicu, Matched Variable, Inbound Anomaly Score, dan Latency overhead (0.84 ms).

### 4. Module 3: Incident Forensic Explorer & False Positive Tuning (FR-3.1 s/d FR-3.3)
- **High-Speed ClickHouse Log Explorer:** Filter jutaan transaksi audit dalam < 500ms berdasarkan Time Range, IP, Host, URI, Rule ID, Action (`DENY`, `ALLOW`), dan Severity.
- **Live Stream Ticker:** Toggle streaming log secara real-time dengan status play/pause.
- **Deep Transaction Forensic Inspector:**
  - Header Request dengan masking data sensitif (header `Authorization`, cookie) sesuai NFR-2.3.
  - Body payload transaksi.
  - Matched variable (`ARGS:username`) dan string data yang cocok (`' OR '1'='1`).
- **One-Click Exception (FR-3.3):**
  - Tombol **"Create Exception / Suppress Rule"** otomatis menyintesis directive SecLang `SecRuleUpdateTargetById 942100 "!ARGS:username"` atau `ctl:ruleRemoveById=942100`.
  - Memangkas MTTR (Mean Time to Resolution) false positive dari 45 menit menjadi **< 2 menit**!
  - Tombol **"Add IP to Blacklist"** sekali klik.

### 5. Module 4: Real-Time Attack Analytics & Threat Intelligence (FR-4.1 & FR-4.2)
- **Attack Analytics KPIs:** Total Throughput (Req/s), Total Blocked Requests (24h), Block Ratio (%), dan Average WAF Latency Overhead.
- **Time-Series Attack Chart:** Grafik perbandingan trafik bersih vs serangan secara visual.
- **Top OWASP CRS Rules:** Diagram batang 5 besar signature serangan yang paling banyak dicegat.
- **Targeted Endpoints & Attacking Sources:** Analisis rute URL berisiko tinggi dan IP penyerang beserta ASN.
- **Threat Intelligence Feeds:** Integrasi feed reputasi IP (AlienVault OTX, AbuseIPDB, Tor Exit Nodes, Spamhaus DROP) dengan toggle auto-pull dan sinkronisasi berkala.
- **IP Reputation Manager:** Allowlist dan Blocklist dengan dukungan subnet CIDR (`192.168.1.0/24`, `10.0.0.0/8`).

### 6. Module 5: RBAC, Auditability & GitOps Integration (FR-5.1 s/d FR-5.3 & Schema 6.1)
- **Multi-Tenant Virtual Hosts (PostgreSQL Core):** Manajemen domain (`api.domain.com`, `auth.domain.com`, dll.) dengan paranoia level dan threshold masing-masing.
- **PRD Persona Switcher:** Pengalihan instan peran pengguna:
  - **Ahmad (SecOps Analyst)**: Triage insiden, tuning false positive, one-click exception.
  - **Budi (Cyber Security Engineer)**: Penulisan SecLang custom rules, Paranoia Level, feed threat intel.
  - **Deni (DevOps / Infrastructure)**: Monitoring node health, latency overhead SLA, sync gRPC stream.
  - **Administrator / CISO**: Akses penuh kontrol plane.
- **Immutable Audit Trail:** Pencatatan setiap aksi perubahan kebijakan ke schema PostgreSQL.
- **GitOps Declarative Spec:** Viewer deklaratif file `coraza-policy.yaml` dengan tombol Copy dan Download untuk integrasi pipeline CI/CD (GitHub Actions / GitLab CI).

### 7. Module: API Cyber Kill Chain & Attack Lifecycle Flow
- **Interactive Stage Flowchart:** Visualisasi 6 tahapan siklus serangan siber API:
  1. *Reconnaissance* (OpenAPI / Swagger Enumeration)
  2. *Weaponization* (Payload Crafting: BOLA/IDOR, SQLi, Malformed Tokens)
  3. *Delivery* (Distributed HTTP Bursts & Parameter Stepping)
  4. *Exploitation* (Triggering OWASP API1/API9 vulnerabilities & Coraza Rule evaluation)
  5. *Privilege Escalation* (Administrative boundary bypass & BFLA)
  6. *Actions on Objectives* (Mass PII Exfiltration — Zero Data Egress / Thwarted)
- **Attack Campaign Scenarios:**
  - *BOLA / IDOR Mass Record Harvesting Attack Campaign (API1:2023)*
  - *Shadow API Exploitation & Remote Command Injection on Legacy Debug Port (API9:2023 / API8:2023)*
- **Deep Technical Forensics:** Inspect raw attacker request payload vs Coraza engine response, IoCs, correlated Rule IDs, and one-click IP shun.

### 8. Module: Application Security Management (ASM / AppSec)
- **Executive Security Posture Score:** Peringkat kesehatan keamanan aplikasi (`Grade A- / 88`), penghitungan Shadow & Zombie APIs, serta persentase kepatuhan schema (94%).
- **API Discovery & Shadow API Hunter:** Katalog endpoint API otomatis dari inspeksi trafik, deteksi endpoint tanpa dokumentasi (Shadow API), rute usang (Zombie API), dan fitur **One-Click Quarantine Endpoint** (drop trafik seketika di layer proxy).
- **Runtime CVE Shield & RASP:** Korelasi inspeksi Coraza dengan CVE komponen backend (Apache Log4j CVE-2021-44228, Spring4Shell CVE-2022-22965, Express.js CVE-2023-38606, runc CVE-2024-21626) dengan status *Virtual Patch Active Shield*.
- **Data Loss Prevention (DLP) & PII Masking:** Masking nomor kartu kredit (PCI-DSS), National ID / NIK, Authorization Bearer tokens, dan password pada log audit dan response payload.

### 9. Global Command Palette (`Ctrl + K` / `Cmd + K`)
- Akses instan ke seluruh modul, pencarian cepat, eksekusi reload gRPC, dan switch persona.

---

## 🛠️ Stack Teknologi Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Glassmorphism Dark Theme
- **Icons:** Lucide React
- **Design Language:** Cyber-Defense Dark Console (Dark slate `#080c16`, cyan telemetry `#06b6d4`, emerald pass `#10b981`, rose alert `#f43f5e`, purple CRS `#8b5cf6`)
- **Fonts:** Inter (UI Typography) & JetBrains Mono (Code/SecLang/IPs)

---

## 💻 Cara Menjalankan Secara Lokal

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Jalankan dev server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di: `http://localhost:5173/`

3. **Build untuk production:**
   ```bash
   npm run build
   ```
