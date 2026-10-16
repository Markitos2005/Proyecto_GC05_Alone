# Initial Planning Review v02

## 1. Run metadata

- **Project:** Lost&Found UEx (`UniExtremadura/Proyecto_GC05`)
- **Mode:** CONSISTENCY / RECHECK
- **Reviewed baseline/scope:** Current product objectives and scope, EP-001..EP-005, team constitution and quality definitions
- **Prior report:** [initial-planning-review-v01.md](./initial-planning-review-v01.md)
- **Source versions/dates:** DoR v0.2 (2026-10-07), DoD v0.2 (2026-10-07); other source versions are not declared
- **Review date:** 2026-10-16
- **Report version:** v02
- **Workbook/extract:** N/A; no Excel source was identified
- **Commit:** Not supplied

## 2. Summary

- **Advisory readiness result:** **NOT_READY**
- **Blocking findings:** 2
- **Principal conclusion:** Three previous findings have been resolved or materially addressed: aggregate capacity is now supported by the team charter, EP-001 maps to G-05, and EP-002 has a consistent story list. However, the planning baseline still has an unjustified story dependency, an unexplained 10 h-p mismatch between epic and story estimates, and no explicit skill-capacity view. The named planning exercise therefore remains not ready for a fully supported hypothesis.

## 3. Evidence inventory and compatibility matrix

| Dimension | Status | Evidence | Limit |
|---|---|---|---|
| Scope and priorities | PARTIALLY_COMPATIBLE | Product scope S-01..S-07 and Must/Should/Could priorities remain explicit | IT-06 now includes additional stories while its row does not name their functional scope beyond a generic reference |
| Requirements maturity / DoR | COMPATIBLE_WITH_LIMITS | Stories have stable IDs, actors, value, acceptance criteria, uncertainty, estimates and predecessors | The causal basis of at least one predecessor remains unclear |
| Estimate coverage and units | NOT_COMPATIBLE (blocking) | Estimates use h-p and are present at epic/story level | Epic totals and story totals differ by 10 h-p without a traceable explanation |
| Effective capacity | COMPATIBLE_WITH_LIMITS | Constitution lists 5 team members with 5, 10, 10, 10 and 5 h/week; total is 40 h/week | The source calls these effective capacities but does not show deductions or a per-iteration capacity rationale |
| Horizon and duration | COMPATIBLE_WITH_LIMITS | Six iterations and one-week sprint length are declared | No calendar dates or external milestone constraints are supplied |
| Dependencies and capabilities | NOT_COMPATIBLE (blocking) | Epic and story predecessors are listed; team roles and individual capacities exist | US-009 still depends on password change US-006 without a documented causal reason; no explicit technical-skill capacity matrix |
| Assumptions and uncertainty | COMPATIBLE_WITH_LIMITS | A-01..A-07 and uncertainty levels are documented | Owners and validation triggers for critical assumptions are not formalized |
| Cost | N/A | No budget, rate or monetary constraint is supplied | Economic feasibility is outside the evidence |
| Planning viability | NOT_COMPATIBLE (blocking) | Iteration loads are listed and each is below 40 h-p in aggregate | Aggregate checks cannot validate unresolved estimate mapping, dependencies or skill bottlenecks |

## 4. Findings

### IPR-v02-001

- **Category:** Dependencies
- **Severity:** MAJOR
- **Blocking:** YES
- **Source/ID:** `specs/EP-002/spec.md`, US-009
- **Observed evidence:** The current story is `US-009 — Búsqueda de objeto perdido` and still declares `US-006` (change password) as a predecessor. The current product flow requires authentication and access control, but no source explains why the password-change feature must be completed before searching for findings.
- **Impact:** The predecessor may impose an artificial sequencing constraint and can make the iteration plan appear more constrained than the functional flow requires.
- **Recommended action:** Revalidate the dependency and either document its causal rationale or replace it with the minimum authentication prerequisite actually required.
- **Question/decision required:** Is search dependent on password change specifically, or only on an authenticated account/session?
- **Proposed owner role:** Team Lead + Functional Analyst

### IPR-v02-002

- **Category:** Estimates
- **Severity:** MAJOR
- **Blocking:** YES
- **Source/ID:** `specs/product/goals.md`, EP-001..EP-005
- **Observed evidence:** Current epic estimates total 168 h-p (36 + 46 + 24 + 31 + 31), while the visible story estimates total 178 h-p. The difference is 10 h-p in the opposite direction from v01; no source explains whether the epic figures exclude/include specific stories or whether one level is stale.
- **Impact:** The baseline cannot support a single auditable total for scope, capacity consumption or remaining margin.
- **Recommended action:** Reconcile each epic total with its story set, or explicitly identify the 10 h-p as approved non-story/transversal work and state where it is included in the iteration loads.
- **Question/decision required:** Which estimate is authoritative for planning: the story-level total (178 h-p), the epic-level total (168 h-p), or a reconciled baseline?
- **Proposed owner role:** Product Owner + Team Lead

### IPR-v02-003

- **Category:** Capacity
- **Severity:** MINOR
- **Blocking:** NO
- **Source/ID:** `.specify/memory/constitution.md`, Team Charter
- **Observed evidence:** Individual effective capacities are now declared: Product Owner 5, Scrum Master 10, Tech Lead 10, DevOps/QA 10 and Developer 5 h/week, totalling 40 h/week.
- **Impact:** The aggregate capacity concern from IPR-v01-001 is addressed. However, no explicit deductions or per-iteration allocation rationale is provided, so this remains a limit on detailed feasibility analysis.
- **Recommended action:** Keep the declared 40 h/week as the planning input and document any exclusions/deductions if the figure is gross rather than net.
- **Question/decision required:** Confirm whether the listed values are net delivery capacity after ceremonies and academic obligations.
- **Proposed owner role:** Product Owner + Scrum Master

### IPR-v02-004

- **Category:** Scope traceability
- **Severity:** MINOR
- **Blocking:** NO
- **Source/ID:** `specs/EP-002/spec.md`, traceability table
- **Observed evidence:** The story list is now internally consistent: `US-008, US-009, US-010 and US-011` match the stories defined in EP-002. The former undefined `US-008` issue is resolved; US-011 remains a recovery-validation story scheduled in IT-05, which is also reflected in its story definition.
- **Impact:** The previous EP-002 traceability break is removed. The remaining cross-epic relationship should be kept synchronized when recovery ownership changes.
- **Recommended action:** No corrective change is required for this IPR; preserve the current IDs and cross-references.
- **Question/decision required:** None for the previous finding.
- **Proposed owner role:** Product Owner

### IPR-v02-005

- **Category:** Objective-to-epic consistency
- **Severity:** MINOR
- **Blocking:** NO
- **Source/ID:** `specs/EP-001/spec.md`, product goals G-05
- **Observed evidence:** EP-001 now references `G-05 — Acceso controlado`, matching the product objective catalogue and M-05.
- **Impact:** The previous G-04/G-05 mismatch is resolved.
- **Recommended action:** No corrective change is required for this IPR.
- **Question/decision required:** None for the previous finding.
- **Proposed owner role:** Product Owner

### IPR-v02-006

- **Category:** Resource feasibility by capability
- **Severity:** MAJOR
- **Blocking:** NO
- **Source/ID:** `.specify/memory/constitution.md`, Team Charter
- **Observed evidence:** Individual capacities and broad roles are declared, but the source does not provide a matrix connecting each iteration or work type to technical capabilities such as implementation, QA, DevOps, security or requirements work.
- **Impact:** Aggregate capacity can be sufficient while a specific capability becomes a bottleneck; this cannot be ruled out from the current evidence.
- **Recommended action:** Add a capability-to-workload check before committing the plan, without inventing allocations in this review.
- **Question/decision required:** Which capabilities are required for each iteration, and what net capacity is available for each?
- **Proposed owner role:** Tech Lead + Scrum Master

## 5. Arithmetic and capacity/resource observations

- **Unit:** person-hours (`h-p`) for both estimates and weekly capacity.
- **Declared individual capacity:** 5 + 10 + 10 + 10 + 5 = **40 h-p/week**.
- **Declared horizon capacity:** 40 × 6 = **240 h-p**, assuming one week per iteration and the declared capacity is net and available in every iteration.
- **Iteration loads listed in `goals.md`:** 25 + 35 + 31 + 35 + 34 + 18 = **178 h-p**.
- **Aggregate iteration margin under that assumption:** 240 − 178 = **62 h-p**.
- **Current epic estimates:** 36 + 46 + 24 + 31 + 31 = **168 h-p**.
- **Current mismatch:** 178 − 168 = **10 h-p**.
- **Important scope limit:** The 62 h-p margin is not a supported commitment because the estimate baseline is unreconciled and no skill-level loading exists.
- **Exclusions:** No invented focus factor, standard workweek, cost, dates, assignment or alternative schedule is introduced.

## 6. Dependencies and capability observations

- **Typed prerequisites observed:** EP-002 depends on EP-001; EP-004 depends on EP-001 and EP-002; EP-005 depends on EP-001..EP-004.
- **Story dependency issue remaining:** `US-009 ← US-006` is not causally evidenced. Other visible chains are broadly consistent with the functional flow, but this review does not approve them.
- **Cycles:** No explicit dependency cycle was identified in the reviewed IDs.
- **External input:** OAuth remains optional/Could with high uncertainty and external-provider dependency; it is not a blocker for the local authentication baseline because US-007 explicitly permits local login to continue.
- **Capabilities:** Team roles and individual capacities are present, but a capability-to-workload matrix is absent; resource feasibility by specialization remains unverified.
- **No generated schedule or allocation:** This review does not assign stories or resources.

## 7. Cost result

- **Result:** N/A
- **Reason:** No budget, rate, monetary limit or cost model is supplied.

## 8. Questions and suggested next actions

| Action/question | Proposed owner role | Validation trigger | Blocking |
|---|---|---|---|
| Reconcile the 168 h-p epic total and 178 h-p story/iteration total | Product Owner + Team Lead | Updated epic/story estimate baseline | Yes |
| Confirm or correct the `US-009 ← US-006` predecessor | Team Lead + Functional Analyst | Updated predecessor list with rationale | Yes |
| Confirm whether the 40 h-p/week values are net capacity | Product Owner + Scrum Master | Capacity statement with deductions/exclusions | No |
| Add a capability-to-workload check for each iteration | Tech Lead + Scrum Master | Capability matrix or equivalent evidence | No |
| Keep EP-001 G-05 and EP-002 story traceability synchronized | Product Owner | Next source review | No |

## 9. RECHECK disposition matrix

| Prior finding | Human decision reference | Changed evidence | Verified state | Remaining impact |
|---|---|---|---|---|
| IPR-v01-001: unsupported 40 h-p/week capacity | No separate decision reference supplied | Constitution Team Charter lists 5, 10, 10, 10 and 5 h/week, total 40 | **Resolved at aggregate-input level** | Net/gross status and skill loading remain unclear |
| IPR-v01-002: EP-002 story traceability mismatch | No separate decision reference supplied | EP-002 now defines and traces US-008..US-011 consistently | **Resolved** | None for the prior mismatch |
| IPR-v01-003: EP-001 G-04/G-05 mismatch | No separate decision reference supplied | EP-001 now references G-05, matching the product catalogue | **Resolved** | None for the prior mismatch |
| IPR-v01-004: questionable predecessor | No separate decision reference supplied | Current EP-002 still has US-009 preceded by US-006 | **Unresolved** | Artificial sequencing may remain |
| IPR-v01-005: epic/story estimate mismatch | No separate decision reference supplied | Epic total is now 168 h-p; visible story/iteration total remains 178 h-p | **Unresolved; changed magnitude/sign** | Planning total and margin are not auditable |
| IPR-v01-006: no capability-level capacity evidence | No separate decision reference supplied | Individual capacities and broad roles were added in the constitution | **Partially addressed** | No explicit capability-to-workload validation |

## 10. Final advice and boundary statement

Readiness for the named planning exercise remains **NOT_READY**. The previous review is materially improved: aggregate team capacity is evidenced, EP-001 objective mapping is corrected, and EP-002 story traceability is corrected. Nevertheless, two blocking issues remain: the unexplained 10 h-p estimate mismatch and the unjustified US-009 predecessor. A capability-level feasibility check is also still recommended.

This report does not create or approve a plan, commitment, baseline, sprint allocation, resource allocation or quality gate. Source requirements, estimates, capacities, dependencies and decisions remain unchanged; only this new RECHECK report was created.
