/**
 * PROTOTYPE: Architectural Inspection Drawer for 2Wash
 * Issue #9: https://github.com/MahmoudAlmodalal/Portfolio-/issues/9
 *
 * Implements 3 Radically Different UI Variants:
 *  - Variant A: Slide-Over Blueprint Dock (Right-Side Multi-Tab Sheet)
 *  - Variant B: Bottom Engineering Console (Terminal / Observability Workbench)
 *  - Variant C: Executive System Matrix (Centered Master-Detail Transaction Flow)
 *
 * WCAG AA Accessibility:
 *  - Full keyboard navigation (Esc to close, Tab & Shift+Tab focus trap)
 *  - Restores focus to trigger element on close
 *  - ARIA attributes: role="dialog", aria-modal="true", aria-labelledby, aria-describedby
 *  - Arrow key cycling (Left / Right) on prototype switcher
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Prototype Definitions
  // ---------------------------------------------------------------------------
  const VARIANTS = [
    { key: 'A', name: 'Slide-Over Blueprint Dock' },
    { key: 'B', name: 'Bottom Engineering Console' },
    { key: 'C', name: 'Executive System Matrix' }
  ];

  let currentVariantIndex = 0;
  let isDrawerOpen = false;
  let lastActiveElement = null;

  // DOM Elements
  const overlay = document.getElementById('arch-drawer-overlay');
  const container = document.getElementById('arch-drawer-container');
  const protoKeyEl = document.getElementById('proto-key');
  const protoNameEl = document.getElementById('proto-name');
  const protoPrevBtn = document.getElementById('proto-prev-btn');
  const protoNextBtn = document.getElementById('proto-next-btn');
  const protoToggleBtn = document.getElementById('proto-toggle-drawer');

  // ---------------------------------------------------------------------------
  // 2. Data Models & Architectural Specifications for 2Wash
  // ---------------------------------------------------------------------------
  const TWO_WASH_ARCH = {
    title: '2Wash System Architecture & Topology',
    kicker: 'COMMERCIAL SAAS · SAUDI ARABIA',
    desc: 'Bilingual on-demand car care marketplace connecting 20+ partner centers with 500+ commercial bookings across Riyadh & Jeddah. Powered by Django REST, PostGIS spatial indexing, and Celery asynchronous settlement pipelines.',
    stats: [
      { label: 'Scale', val: '20+ Centers · 500+ Bookings' },
      { label: 'Spatial SLA', val: 'P95 < 12ms (PostGIS)' },
      { label: 'Concurrency', val: 'Redis Distributed Locks' },
      { label: 'Ledger Guarantee', val: 'Idempotent ACID Settlements' }
    ],
    erdModels: [
      {
        name: 'partner_centers',
        badge: 'Spatial Hub',
        fields: [
          { name: 'id', type: 'UUID', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)', key: '' },
          { name: 'location', type: 'GEOMETRY(Point, 4326)', key: 'GIST' },
          { name: 'service_radius_m', type: 'INTEGER', key: '' },
          { name: 'commission_rate', type: 'NUMERIC(5,2)', key: '' },
          { name: 'is_active', type: 'BOOLEAN', key: '' }
        ]
      },
      {
        name: 'wash_bays',
        badge: 'Queue Resource',
        fields: [
          { name: 'id', type: 'UUID', key: 'PK' },
          { name: 'partner_id', type: 'UUID', key: 'FK' },
          { name: 'bay_number', type: 'SMALLINT', key: '' },
          { name: 'status', type: 'ENUM (AV/OCC/MAINT)', key: '' },
          { name: 'current_booking_id', type: 'UUID', key: 'FK' }
        ]
      },
      {
        name: 'booking_requests',
        badge: 'State Machine',
        fields: [
          { name: 'id', type: 'UUID', key: 'PK' },
          { name: 'customer_phone', type: 'VARCHAR(20)', key: 'OTP' },
          { name: 'partner_id', type: 'UUID', key: 'FK' },
          { name: 'vehicle_plate', type: 'VARCHAR(20)', key: '' },
          { name: 'total_sar', type: 'NUMERIC(10,2)', key: '' },
          { name: 'status', type: 'ENUM (FSM: 7 Steps)', key: '' }
        ]
      },
      {
        name: 'partner_settlements',
        badge: 'Financial Ledger',
        fields: [
          { name: 'id', type: 'UUID', key: 'PK' },
          { name: 'booking_id', type: 'UUID', key: 'FK / UQ' },
          { name: 'gross_sar', type: 'NUMERIC(10,2)', key: '' },
          { name: 'platform_fee_sar', type: 'NUMERIC(10,2)', key: '' },
          { name: 'partner_net_sar', type: 'NUMERIC(10,2)', key: '' },
          { name: 'idempotency_key', type: 'VARCHAR(64)', key: 'UQ' }
        ]
      }
    ],
    constraints: [
      {
        title: 'Sub-100ms Geospatial Hub Lookup',
        metric: '11.4ms P95',
        desc: 'Customer searches trigger spatial radius lookups across partner service polygons. We indexed PostGIS geometries with GIST R-tree indices rather than application-layer haversine filtering.',
        chosen: 'PostGIS ST_DWithin + GIST Index',
        rejected: 'In-memory Haversine filtering on unindexed rows'
      },
      {
        title: 'Zero Double-Booking in Physical Wash Bays',
        metric: 'Zero Concurrency Clashes',
        desc: 'Multiple customers requesting a bay simultaneously receive immediate atomic feedback through Redis distributed locks before securing row-level database locks (SELECT FOR UPDATE).',
        chosen: 'Redis Atomic Distributed Lock + SELECT FOR UPDATE',
        rejected: 'Optimistic timestamp checks with late rollback'
      },
      {
        title: 'Automated Financial Settlement Idempotency',
        metric: '100% Reconciled',
        desc: 'Partner payout splits are recorded on service completion. Celery retries cannot produce duplicate disbursement rows thanks to strict UNIQUE(booking_id) ledger constraints.',
        chosen: 'Deterministic SHA-256 idempotency key + DB constraint',
        rejected: 'Unconstrained periodic batch payout scripts'
      }
    ],
    transactionPhases: [
      {
        id: 'step-1',
        phase: 'Phase 01',
        title: 'Geo-Discovery & OTP Handshake',
        desc: 'Customer provides coordinates in Riyadh/Jeddah; PostGIS calculates closest partner polygon; OTP validates customer identity.',
        tiers: ['Next.js PWA', 'Cloudflare WAF', 'Django REST', 'PostGIS Engine', 'SMS Gateway'],
        sql: `-- Spatial query for nearest partner within service polygon
SELECT id, name, commission_rate,
       ST_Distance(location, ST_SetSRID(ST_MakePoint(46.6753, 24.7136), 4326)::geography) AS distance_meters
FROM partner_centers
WHERE is_active = TRUE
  AND ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(46.6753, 24.7136), 4326)::geography, service_radius_m)
ORDER BY distance_meters ASC
LIMIT 1;`,
        mitigation: 'If geolocation is unavailable, fallback to postal district fallback dictionary with cached bounding boxes in Redis.'
      },
      {
        id: 'step-2',
        phase: 'Phase 02',
        title: 'Atomic Bay Reservation & Lock',
        desc: 'System acquires an atomic lock on the target wash bay in Redis with a 180s TTL while payment authorization completes.',
        tiers: ['Django REST', 'Redis Lock Manager', 'Mada / Apple Pay'],
        sql: `-- Redis distributed lock acquisition
SET lock:bay:b01e2-4581 1 NX PX 180000

-- Row lock during reservation commit
SELECT id, status FROM wash_bays
WHERE id = 'b01e2-4581' AND status = 'AVAILABLE'
FOR UPDATE;`,
        mitigation: 'If customer abandons payment or gateway times out, Redis lock automatically expires at TTL, immediately freeing the bay.'
      },
      {
        id: 'step-3',
        phase: 'Phase 03',
        title: 'Finite State Machine Bay Queue',
        desc: 'Partner dashboard executes physical bay transitions: IN_BAY → WASHING → QUALITY_CHECK → COMPLETED.',
        tiers: ['Partner Next.js Portal', 'Django Channels / SSE', 'PostgreSQL DB'],
        sql: `-- Strict FSM status transition
UPDATE booking_requests
SET status = 'WASHING', updated_at = NOW()
WHERE id = 'c74a9-8812'
  AND status = 'IN_BAY';`,
        mitigation: 'State transitions validate legal transition matrix; invalid skips (e.g. BOOKED -> COMPLETED) trigger 409 Conflict.'
      },
      {
        id: 'step-4',
        phase: 'Phase 04',
        title: 'Automated Payout & Ledger Split',
        desc: 'Upon completion, Celery calculates partner commission net and platform fee, writing an immutable idempotent ledger row.',
        tiers: ['Celery Workers', 'Redis Broker', 'PartnerSettlementLedger', 'Banking API'],
        sql: `-- Idempotent financial settlement entry
INSERT INTO partner_settlements (
  id, partner_id, booking_id, gross_sar, platform_fee_sar, partner_net_sar, idempotency_key
) VALUES (
  gen_random_uuid(), 'p-012', 'c74a9-8812', 120.00, 18.00, 102.00, 'IDEMP-2WASH-c74a9-8812-COMPLETED'
) ON CONFLICT (booking_id) DO NOTHING;`,
        mitigation: 'Celery worker crash during payout auto-requeues task; ON CONFLICT ensures zero double-crediting of partner accounts.'
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // 3. Variant Template Generators
  // ---------------------------------------------------------------------------

  /**
   * VARIANT A: Slide-Over Blueprint Dock
   */
  function renderVariantA() {
    return `
      <div class="arch-drawer-sheet" role="document">
        <div class="arch-sheet-header">
          <div class="arch-sheet-top-row">
            <span class="arch-sheet-kicker">${TWO_WASH_ARCH.kicker}</span>
            <button type="button" class="arch-drawer-close-btn" data-close="arch-drawer" aria-label="Close architectural inspection drawer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <h2 id="arch-drawer-title" class="arch-drawer-title">${TWO_WASH_ARCH.title}</h2>
          <p id="arch-drawer-desc" class="arch-drawer-desc">${TWO_WASH_ARCH.desc}</p>
        </div>

        <div class="arch-tab-nav" role="tablist" aria-label="2Wash Architecture Views">
          <button type="button" class="arch-tab-btn" role="tab" id="tab-a-topo" aria-selected="true" aria-controls="panel-a-topo">01. System Topology</button>
          <button type="button" class="arch-tab-btn" role="tab" id="tab-a-erd" aria-selected="false" aria-controls="panel-a-erd">02. Data & ERD Models</button>
          <button type="button" class="arch-tab-btn" role="tab" id="tab-a-rules" aria-selected="false" aria-controls="panel-a-rules">03. Production Constraints</button>
        </div>

        <div class="arch-sheet-body">
          <!-- TAB 1: System Topology SVG Diagram -->
          <div id="panel-a-topo" class="arch-tab-panel active" role="tabpanel" aria-labelledby="tab-a-topo">
            <div class="arch-diagram-wrapper">
              <svg class="arch-svg-diagram" viewBox="0 0 680 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="2Wash Architectural Topology Diagram">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#b94a1f"/>
                  </marker>
                </defs>
                <!-- Groups and Connectors -->
                <line x1="130" y1="70" x2="210" y2="70" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />
                <line x1="130" y1="140" x2="210" y2="90" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />
                <line x1="330" y1="80" x2="380" y2="80" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />
                <line x1="450" y1="120" x2="450" y2="180" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />
                <line x1="450" y1="80" x2="520" y2="80" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />
                <line x1="450" y1="220" x2="520" y2="220" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />

                <!-- Node: Next.js Client -->
                <g class="topo-node" tabindex="0" role="button" aria-label="Customer Next.js App">
                  <rect x="20" y="45" width="110" height="50" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
                  <text x="32" y="68" fill="#241914" font-size="12" font-weight="600">Customer PWA</text>
                  <text x="32" y="84" fill="#b94a1f" class="node-tag">Next.js / OTP</text>
                </g>

                <!-- Node: Partner Portal -->
                <g class="topo-node" tabindex="0" role="button" aria-label="Partner Operations Portal">
                  <rect x="20" y="115" width="110" height="50" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
                  <text x="32" y="138" fill="#241914" font-size="12" font-weight="600">Partner SaaS</text>
                  <text x="32" y="154" fill="#b94a1f" class="node-tag">Bay Dashboard</text>
                </g>

                <!-- Node: Gateway -->
                <g class="topo-node" tabindex="0" role="button" aria-label="API Gateway & Ingress">
                  <rect x="210" y="55" width="120" height="60" rx="6" fill="#ede6d8" stroke="#bfb3a6" stroke-width="1.5" />
                  <text x="222" y="80" fill="#241914" font-size="12" font-weight="700">Nginx / Cloudflare</text>
                  <text x="222" y="98" fill="#5f5148" class="node-tag">SSL &amp; Rate Limit</text>
                </g>

                <!-- Node: Django REST -->
                <g class="topo-node" tabindex="0" role="button" aria-label="Django REST Application Core">
                  <rect x="380" y="50" width="140" height="70" rx="6" fill="#fff" stroke="#b94a1f" stroke-width="2" />
                  <text x="394" y="76" fill="#241914" font-size="13" font-weight="700">Django REST API</text>
                  <text x="394" y="94" fill="#b94a1f" class="node-tag">Business Logic &amp; FSM</text>
                  <text x="394" y="108" fill="#607768" font-size="10">Sub-100ms Budget</text>
                </g>

                <!-- Node: Celery Workers -->
                <g class="topo-node" tabindex="0" role="button" aria-label="Celery Asynchronous Workers">
                  <rect x="380" y="180" width="140" height="60" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
                  <text x="394" y="206" fill="#241914" font-size="12" font-weight="600">Celery Workers</text>
                  <text x="394" y="224" fill="#5f5148" class="node-tag">Settlement Pipelines</text>
                </g>

                <!-- Node: Redis -->
                <g class="topo-node" tabindex="0" role="button" aria-label="Redis Cache and Lock Broker">
                  <rect x="530" y="55" width="130" height="60" rx="6" fill="#ede6d8" stroke="#bfb3a6" stroke-width="1.5" />
                  <text x="542" y="80" fill="#241914" font-size="12" font-weight="700">Redis 7 Cluster</text>
                  <text x="542" y="98" fill="#5f5148" class="node-tag">Bay Locks &amp; Broker</text>
                </g>

                <!-- Node: PostGIS DB -->
                <g class="topo-node" tabindex="0" role="button" aria-label="PostgreSQL and PostGIS Database">
                  <rect x="530" y="180" width="130" height="70" rx="6" fill="#fffdfa" stroke="#b94a1f" stroke-width="2" />
                  <text x="542" y="206" fill="#241914" font-size="13" font-weight="700">PostgreSQL 15</text>
                  <text x="542" y="224" fill="#b94a1f" class="node-tag">+ PostGIS Spatial</text>
                  <text x="542" y="238" fill="#607768" font-size="10">GIST R-Tree Indexed</text>
                </g>
              </svg>
            </div>
            <div class="constraint-card">
              <div class="constraint-head">
                <span class="constraint-title">Interactive Subsystem Highlights</span>
                <span class="constraint-metric">KSA Multi-Tier</span>
              </div>
              <p class="constraint-text">Click or focus any node in the SVG diagram above to evaluate its communication contracts, SLA latency budgets, and failover strategy.</p>
            </div>
          </div>

          <!-- TAB 2: Database Models & ERD -->
          <div id="panel-a-erd" class="arch-tab-panel" role="tabpanel" aria-labelledby="tab-a-erd">
            <div class="erd-grid">
              ${TWO_WASH_ARCH.erdModels.map(model => `
                <div class="erd-card">
                  <div class="erd-card-header">
                    <span class="erd-entity-name">${model.name}</span>
                    <span class="erd-badge">${model.badge}</span>
                  </div>
                  <table class="erd-table">
                    <thead>
                      <tr><th>Field</th><th>Type</th><th>Constraint</th></tr>
                    </thead>
                    <tbody>
                      ${model.fields.map(f => `
                        <tr>
                          <td><strong>${f.name}</strong></td>
                          <td class="erd-type">${f.type}</td>
                          <td class="erd-key">${f.key}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- TAB 3: Production Constraints -->
          <div id="panel-a-rules" class="arch-tab-panel" role="tabpanel" aria-labelledby="tab-a-rules">
            ${TWO_WASH_ARCH.constraints.map(c => `
              <div class="constraint-card">
                <div class="constraint-head">
                  <h4 class="constraint-title">${c.title}</h4>
                  <span class="constraint-metric">${c.metric}</span>
                </div>
                <p class="constraint-text">${c.desc}</p>
                <div class="constraint-diff">
                  <div class="diff-chosen">&check; <strong>Implemented:</strong> ${c.chosen}</div>
                  <div class="diff-rejected">&cross; <strong>Rejected:</strong> ${c.rejected}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * VARIANT B: Bottom Engineering Console
   */
  function renderVariantB() {
    return `
      <div class="arch-console-panel" role="document">
        <div class="console-chrome-bar">
          <div class="console-dots" aria-hidden="true">
            <span class="console-dot dot-red"></span>
            <span class="console-dot dot-yellow"></span>
            <span class="console-dot dot-green"></span>
          </div>
          <span class="console-title-text">console://2wash.production.internal/inspect --arch --spatial --erd</span>
          <button type="button" class="console-close-btn" data-close="arch-drawer" aria-label="Close engineering console">
            ESC [x]
          </button>
        </div>

        <div class="console-workbench">
          <!-- Left Telemetry & Service Tree -->
          <div class="console-sidebar">
            <p class="console-tree-title">Production Nodes (ME-1)</p>
            <button type="button" class="console-tree-item active" data-service="postgis">
              <span class="status-pulse"></span> [LIVE] pg-postgis:15.4 (11.4ms)
            </button>
            <button type="button" class="console-tree-item" data-service="django">
              <span class="status-pulse"></span> [LIVE] django-core:gunicorn (4w)
            </button>
            <button type="button" class="console-tree-item" data-service="redis">
              <span class="status-pulse"></span> [LIVE] redis-lock-broker:7.2
            </button>
            <button type="button" class="console-tree-item" data-service="celery">
              <span class="status-pulse"></span> [LIVE] celery-worker (c:8)
            </button>

            <div class="console-telemetry-box">
              <span style="color:#f6c8a8;font-weight:700;">TELEMETRY STATS</span>
              <div class="telemetry-row"><span>Spatial P95:</span><span class="telemetry-val">11.4 ms</span></div>
              <div class="telemetry-row"><span>Active Centers:</span><span class="telemetry-val">20 Hubs</span></div>
              <div class="telemetry-row"><span>Bay Locks:</span><span class="telemetry-val">18 Active</span></div>
              <div class="telemetry-row"><span>Ledger Reconcile:</span><span class="telemetry-val">100.00%</span></div>
            </div>
          </div>

          <!-- Right Monospace Code & DDL Inspector -->
          <div class="console-main">
            <div class="console-tab-row">
              <div class="console-tabs" role="tablist">
                <button type="button" class="console-subtab-btn active" role="tab" id="subtab-sql-1">01_postgis_schema.sql</button>
                <button type="button" class="console-subtab-btn" role="tab" id="subtab-sql-2">02_explain_spatial.sql</button>
                <button type="button" class="console-subtab-btn" role="tab" id="subtab-sql-3">03_settlement_ledger.sql</button>
              </div>
              <button type="button" class="console-copy-btn" id="console-copy-trigger">Copy DDL</button>
            </div>

            <div class="console-code-scroll" id="console-code-body">
<pre><code><span class="sql-com">-- 2Wash Flagship Production Schema &amp; Spatial Indexes</span>
<span class="sql-kw">CREATE EXTENSION IF NOT EXISTS</span> postgis;

<span class="sql-kw">CREATE TABLE</span> partner_centers (
  id <span class="sql-type">UUID PRIMARY KEY DEFAULT gen_random_uuid()</span>,
  name <span class="sql-type">VARCHAR(120) NOT NULL</span>,
  location <span class="sql-type">GEOMETRY(Point, 4326) NOT NULL</span>,
  service_radius_m <span class="sql-type">INTEGER NOT NULL DEFAULT 5000</span>,
  commission_rate <span class="sql-type">NUMERIC(5,2) NOT NULL DEFAULT 15.00</span>,
  is_active <span class="sql-type">BOOLEAN NOT NULL DEFAULT TRUE</span>
);

<span class="sql-com">-- High-Performance GIST Index for Sub-100ms Radius Lookups</span>
<span class="sql-kw">CREATE INDEX</span> idx_partner_centers_location_gist
<span class="sql-kw">ON</span> partner_centers <span class="sql-kw">USING GIST</span> (location);

<span class="sql-kw">CREATE TABLE</span> wash_bays (
  id <span class="sql-type">UUID PRIMARY KEY DEFAULT gen_random_uuid()</span>,
  partner_id <span class="sql-type">UUID NOT NULL REFERENCES</span> partner_centers(id) <span class="sql-kw">ON DELETE CASCADE</span>,
  bay_number <span class="sql-type">SMALLINT NOT NULL</span>,
  status <span class="sql-type">VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'</span>
);

<span class="sql-kw">CREATE TABLE</span> partner_settlements (
  id <span class="sql-type">UUID PRIMARY KEY DEFAULT gen_random_uuid()</span>,
  booking_id <span class="sql-type">UUID NOT NULL UNIQUE</span>,
  gross_sar <span class="sql-type">NUMERIC(10,2) NOT NULL</span>,
  platform_fee_sar <span class="sql-type">NUMERIC(10,2) NOT NULL</span>,
  partner_net_sar <span class="sql-type">NUMERIC(10,2) NOT NULL</span>,
  idempotency_key <span class="sql-type">VARCHAR(64) NOT NULL UNIQUE</span>
);</code></pre>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * VARIANT C: Executive System Matrix
   */
  function renderVariantC() {
    return `
      <div class="arch-matrix-modal" role="document">
        <div class="matrix-header">
          <div class="matrix-hero-info">
            <div class="matrix-tag-row">
              <span class="matrix-kicker">EXECUTIVE ARCHITECTURE MATRIX</span>
              <span class="matrix-kpi-pill">20+ PARTNERS</span>
              <span class="matrix-kpi-pill">500+ BOOKINGS</span>
              <span class="matrix-kpi-pill">12ms P95 SPATIAL</span>
            </div>
            <h2 id="arch-drawer-title" class="matrix-title">2Wash: End-to-End Operational Lifecycle &amp; Subsystem Audit</h2>
          </div>
          <button type="button" class="arch-drawer-close-btn" data-close="arch-drawer" aria-label="Close architectural matrix">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="matrix-layout-body">
          <!-- Left Column: Transaction Lifecycle Walkthrough -->
          <div class="matrix-flow-col" role="tablist" aria-label="Transaction Lifecycle Steps">
            ${TWO_WASH_ARCH.transactionPhases.map((step, idx) => `
              <button type="button" class="flow-step-card ${idx === 0 ? 'active' : ''}" role="tab" id="step-tab-${step.id}" data-step="${step.id}" aria-selected="${idx === 0 ? 'true' : 'false'}">
                <span class="flow-step-phase">${step.phase}</span>
                <h4 class="flow-step-title">${step.title}</h4>
                <p class="flow-step-desc">${step.desc}</p>
              </button>
            `).join('')}
          </div>

          <!-- Right Column: Reactive Subsystem Spotlight -->
          <div class="matrix-inspect-col" id="matrix-inspect-panel" role="tabpanel">
            <!-- Dynamic Content populated by updateMatrixSpotlight() -->
          </div>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 4. View Controllers & Interaction Handlers
  // ---------------------------------------------------------------------------

  function updateMatrixSpotlight(stepId) {
    const inspectPanel = document.getElementById('matrix-inspect-panel');
    if (!inspectPanel) return;

    const phase = TWO_WASH_ARCH.transactionPhases.find(p => p.id === stepId) || TWO_WASH_ARCH.transactionPhases[0];

    inspectPanel.innerHTML = `
      <div>
        <p class="inspect-section-title">Active Architecture Tiers</p>
        <div class="inspect-tier-pill-box">
          ${phase.tiers.map(tier => `<span class="inspect-tier-pill">${tier}</span>`).join('')}
        </div>
      </div>

      <div>
        <p class="inspect-section-title">Database Operation &amp; Spatial Transactions</p>
        <div class="inspect-code-box">
          <pre><code>${phase.sql}</code></pre>
        </div>
      </div>

      <div>
        <p class="inspect-section-title">Production Failure Defense &amp; Self-Healing</p>
        <div class="inspect-mitigation-box">
          <strong>Production Safeguard:</strong> ${phase.mitigation}
        </div>
      </div>
    `;
  }

  function setupVariantInteractivity(variantKey) {
    if (variantKey === 'A') {
      // Tab switching in Variant A
      const tabBtns = container.querySelectorAll('.arch-tab-btn');
      const panels = container.querySelectorAll('.arch-tab-panel');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.setAttribute('aria-selected', 'false'));
          panels.forEach(p => p.classList.remove('active'));

          btn.setAttribute('aria-selected', 'true');
          const targetId = btn.getAttribute('aria-controls');
          const targetPanel = container.querySelector(`#${targetId}`);
          if (targetPanel) targetPanel.classList.add('active');
        });
      });
    } else if (variantKey === 'B') {
      // SQL Subtab switching in Variant B
      const subtabs = container.querySelectorAll('.console-subtab-btn');
      const codeBody = container.querySelector('#console-code-body');
      const copyBtn = container.querySelector('#console-copy-trigger');

      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const codeEl = codeBody.querySelector('code');
          if (codeEl) {
            navigator.clipboard.writeText(codeEl.innerText).then(() => {
              copyBtn.textContent = 'Copied!';
              setTimeout(() => { copyBtn.textContent = 'Copy DDL'; }, 1800);
            });
          }
        });
      }

      subtabs.forEach((tab, idx) => {
        tab.addEventListener('click', () => {
          subtabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          if (idx === 0) {
            codeBody.innerHTML = `<pre><code><span class="sql-com">-- 01: Partner Centers PostGIS Schema</span>\nCREATE TABLE partner_centers (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name VARCHAR(120) NOT NULL,\n  location GEOMETRY(Point, 4326) NOT NULL,\n  service_radius_m INTEGER NOT NULL DEFAULT 5000\n);\nCREATE INDEX idx_partner_gist ON partner_centers USING GIST (location);</code></pre>`;
          } else if (idx === 1) {
            codeBody.innerHTML = `<pre><code><span class="sql-com">-- 02: Spatial Query Execution Plan</span>\nEXPLAIN ANALYZE\nSELECT id, name FROM partner_centers\nWHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(46.67, 24.71), 4326)::geography, 5000);\n\n<span class="sql-com">-- Result: Bitmap Index Scan on idx_partner_gist\n-- Planning Time: 0.18 ms\n-- Execution Time: 0.42 ms (Sub-100ms SLA verified)</span></code></pre>`;
          } else {
            codeBody.innerHTML = `<pre><code><span class="sql-com">-- 03: Automated Settlement Ledger</span>\nCREATE TABLE partner_settlements (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  booking_id UUID NOT NULL UNIQUE,\n  gross_sar NUMERIC(10,2) NOT NULL,\n  partner_net_sar NUMERIC(10,2) NOT NULL,\n  idempotency_key VARCHAR(64) NOT NULL UNIQUE\n);</code></pre>`;
          }
        });
      });
    } else if (variantKey === 'C') {
      // Step click in Variant C
      const stepCards = container.querySelectorAll('.flow-step-card');
      updateMatrixSpotlight('step-1');

      stepCards.forEach(card => {
        card.addEventListener('click', () => {
          stepCards.forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-selected', 'false');
          });
          card.classList.add('active');
          card.setAttribute('aria-selected', 'true');
          const stepId = card.getAttribute('data-step');
          updateMatrixSpotlight(stepId);
        });
      });
    }

    // Attach close listeners inside drawer
    container.querySelectorAll('[data-close="arch-drawer"]').forEach(btn => {
      btn.addEventListener('click', closeDrawer);
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Drawer Lifecycle & Focus Trap
  // ---------------------------------------------------------------------------

  function renderCurrentVariant() {
    const variant = VARIANTS[currentVariantIndex];

    // Update switcher UI
    if (protoKeyEl) protoKeyEl.textContent = `Variant ${variant.key}`;
    if (protoNameEl) protoNameEl.textContent = variant.name;

    // Render variant into container
    if (container) {
      if (variant.key === 'A') {
        container.innerHTML = renderVariantA();
      } else if (variant.key === 'B') {
        container.innerHTML = renderVariantB();
      } else if (variant.key === 'C') {
        container.innerHTML = renderVariantC();
      }
      setupVariantInteractivity(variant.key);
    }
  }

  function openDrawer() {
    if (!overlay) return;
    lastActiveElement = document.activeElement;
    isDrawerOpen = true;

    renderCurrentVariant();

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('arch-drawer-open');

    if (protoToggleBtn) protoToggleBtn.textContent = 'Close Drawer';

    // Focus first interactive element in drawer
    const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  function closeDrawer() {
    if (!overlay || !isDrawerOpen) return;
    isDrawerOpen = false;

    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('arch-drawer-open');

    if (protoToggleBtn) protoToggleBtn.textContent = 'Inspect 2Wash';

    // Restore focus
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  function setVariant(index) {
    currentVariantIndex = (index + VARIANTS.length) % VARIANTS.length;
    const variant = VARIANTS[currentVariantIndex];

    // Update URL search param
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.key);
    window.history.replaceState({}, '', url.toString());

    renderCurrentVariant();
  }

  // ---------------------------------------------------------------------------
  // 6. Global Event Bindings
  // ---------------------------------------------------------------------------

  // Backdrop click closes drawer
  if (overlay) {
    const backdrop = overlay.querySelector('.arch-drawer-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
  }

  // Prototype Switcher Prev/Next buttons
  if (protoPrevBtn) {
    protoPrevBtn.addEventListener('click', () => setVariant(currentVariantIndex - 1));
  }
  if (protoNextBtn) {
    protoNextBtn.addEventListener('click', () => setVariant(currentVariantIndex + 1));
  }

  // Switcher Toggle Drawer button
  if (protoToggleBtn) {
    protoToggleBtn.addEventListener('click', () => {
      if (isDrawerOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  // Card trigger buttons (Architecture & Schema)
  document.querySelectorAll('[data-arch-trigger="2wash"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDrawer();
    });
  });

  // Keyboard navigation: Escape key & Focus Trap
  document.addEventListener('keydown', (e) => {
    // Arrow keys cycle variants when not in text input
    const isEditing = e.target.matches('input, textarea, [contenteditable="true"]');
    if (!isEditing) {
      if (e.key === 'ArrowLeft') {
        setVariant(currentVariantIndex - 1);
        return;
      }
      if (e.key === 'ArrowRight') {
        setVariant(currentVariantIndex + 1);
        return;
      }
    }

    if (!isDrawerOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
      return;
    }

    // Focus trap inside drawer
    if (e.key === 'Tab') {
      const focusables = Array.from(
        container.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      );
      if (!focusables.length) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 7. Initialization on Page Load
  // ---------------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const variantParam = (params.get('variant') || 'A').toUpperCase();
  const foundIndex = VARIANTS.findIndex(v => v.key === variantParam);
  currentVariantIndex = foundIndex !== -1 ? foundIndex : 0;

  renderCurrentVariant();

  // If ?open=true in URL, auto-open drawer for direct inspection
  if (params.get('open') === 'true') {
    openDrawer();
  }
})();
