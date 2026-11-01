# Featured Case Study Lineup and Interactive Visual Lightbox

## Context
The engineering portfolio previously featured three case studies (EduTracker, Noor Al-Huda, clientMORE) and redirected project card images directly to external destination URLs upon click, preventing visitors from inspecting high-fidelity interface details, responsive layouts, or multi-view screenshots within the portfolio environment.

## Decision
1. Position 2Wash as the primary flagship case study (#01) in the Featured Projects grid under `Backend & SaaS`, showcasing its commercial scale in Saudi Arabia (20+ partner centers, 500+ bookings), geospatial PostGIS architecture, and multi-tenant operational portal.
2. Introduce an accessible, zero-dependency in-page `Visual Lightbox` for all project cards. Clicking any card visual opens the high-resolution WebP mockup in a modal viewer with project facts, keyboard navigation (Esc/Tab trap), and live platform CTA, while preserving dedicated text links for external navigation.
3. Keep the 2Wash private repository hidden from public view, highlighting the verified live deployment (`https://2wash.app/`).

## Consequences
Visitors gain an immediate high-resolution preview of production applications without disruption or accidental navigation away from the portfolio. Page load speed is sustained by serving optimized <50KB WebP assets with deferred scripts.
