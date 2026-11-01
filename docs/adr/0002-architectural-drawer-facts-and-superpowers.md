# Architectural Drawer Specifications: clientMORE & EduTracker Superpowers

## Context
Following the prototype of the in-page Architectural Drawer component for 2Wash (Issue #9), Issue #11 requested the exact system topologies, database schemas, and production scale metrics for the remaining flagship systems: **clientMORE** (Applied RAG pipeline) and **EduTracker** (Multi-tenant SaaS).

To avoid visual cognitive overload and maximize impact for senior engineering evaluators, the content was distilled into focused **Architectural Superpowers** (high-signal metrics, high-level isolation/pipeline flows, 4 core database models, and explicit chosen vs rejected trade-offs).

## Decision

### 1. Unified 4-Part Architectural Anatomy
All flagship systems in the portfolio (2Wash, EduTracker, clientMORE) adhere to a consistent 4-part inspection structure:
- **Executive Production Metrics**: 4 quantitative SLA, concurrency, and scale benchmarks.
- **Interactive System Topology**: High-level visual pipeline / isolation flow with click-to-inspect nodes.
- **Relational & Vector Schemas**: 4 cornerstone entity models with field types, constraints, and indexes.
- **Production Constraints & Trade-Offs**: 3 deep-dive engineering decisions comparing the chosen approach against rejected alternatives.

### 2. clientMORE Specifications (Applied RAG Infrastructure)
- **Scale & Latency SLAs**: Generation SLA $P95 < 800\text{ms}$ (streaming token response), Hybrid Retrieval $P95 < 95\text{ms}$ (dense ChromaDB + BM25), Intent Gating Confidence $\ge 0.70$, Provider Availability $99.95\%$.
- **Topology & Pipeline**: 4-stage pipeline: (1) Ingestion & Arabic Normalization (folding alef/hamza/taa-marbuta and converting Eastern digits `٥` $\rightarrow$ `5`), (2) Multichannel Webhook Ingress (Twilio WhatsApp, SMS, Web), (3) Pure-Python Hybrid Retrieval & Provider Fallback (Dense + Lexical BM25 with Reciprocal Rank Fusion $k=60$ $\rightarrow$ Gemini 2.5 Flash $\rightarrow$ DeepSeek-V3 $\rightarrow$ OpenAI chain), and (4) Autonomous Human Handoff with closed-loop knowledge base re-indexing.
- **Database Models**: `documents` (Knowledge Base & chunking metadata), `conversations` (multichannel session state), `handoffs` (escalation FSM), and `learned_answers` (closed-loop agent feedback).
- **Core Trade-Offs**:
  1. *Resilient Multi-Provider Fallback vs Single-Provider Lock-in*: OpenAI-compatible client interface with persistent process-cached `httpx` connection pools.
  2. *Pure-Python Hybrid Retrieval vs Heavy External Engines*: Eliminates Elasticsearch/Meilisearch by fusing dense vector embeddings with in-memory BM25 lexical search via RRF.
  3. *Closed-Loop Ingestion vs Delayed Retraining*: Automatically indexes resolved agent answers (`learned-{id}`) directly into vector storage.

### 3. EduTracker Specifications (Enterprise Multi-Tenant SaaS)
- **Scale & Verification**: 64 Relational Entities across 15 domain apps, 40+ schools across 5 regional districts, 665 automated CI tests (green), and Subdomain DNS Resolution $P95 < 3\text{ms}$.
- **Topology & Isolation**: 4-tier isolation architecture: (1) Wildcard DNS Ingress (`*.edutracker.site`), (2) Host Header Tenant Extraction Middleware, (3) Row-Level Query Scoping via `user.work_stream_id` and origin-scoped `sessionStorage` JWTs, and (4) Asynchronous Celery Worker Pools for district-wide gradebook compilation.
- **Database Models**: `work_streams` (tenant district), `schools` (institutional node), `accounts_user` (scoped identity across 10 roles), and `attendance` (high-volume operational ledger with unique constraints on student, classroom, date).
- **Core Trade-Offs**:
  1. *Row-Level Multi-Tenancy vs Database-per-Tenant*: Shared PostgreSQL database with strict service policy layers eliminates the operational overhead of managing 40 separate databases.
  2. *Subdomain DNS + Origin-Scoped Sessions vs Global SSO Cookies*: Origin-isolated JWT storage guarantees zero cross-tenant token or session bleeding.
  3. *Asynchronous Celery Workers vs Synchronous HTTP Processing*: Background execution prevents HTTP gateway timeouts during mass report card generation.

## Consequences
- Every featured project card on the portfolio (`2Wash`, `EduTracker`, `clientMORE`) now features an accessible `Inspect Architecture` action button.
- Recruiters and senior tech leads can inspect concrete, code-backed engineering artifacts without navigating away from the portfolio.
- EduTracker's entity count was corrected from 32 to 64 across both the portfolio UI and technical documentation.
