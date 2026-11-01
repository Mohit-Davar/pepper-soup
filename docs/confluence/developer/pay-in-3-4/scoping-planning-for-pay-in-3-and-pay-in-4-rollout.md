<!-- Labels: developer, pay-in-3-4 -->
# Scoping & Planning for Pay in 3 and Pay in 4 rollout

This page documents the scoping and planning work item for the Pay in 3 and Pay in 4 rollout within the Pepper-Soup BNPL domain. It is targeted at backend Java engineers, integrators, and Fineract contributors who will contribute to subsequent design and implementation. Reflecting the reference specification, this artifact focuses on scoping activities and intentionally excludes implementation details. The deliverables produced by this work item serve as the boundary definition and planning basis for the rollout, guiding later design, development, and integration work.

### Objectives
- Establish clear scope boundaries for the Pay in 3 and Pay in 4 rollout, including what is in scope and what lies outside the current planning window. 
- Align the rollout with the existing BNPL architecture’s principles and governance, verifying consistency with current strategy and standards.
- Identify high-level interfaces, touchpoints, and data considerations with BNPL components that will be impacted by the rollout, without specifying implementation artifacts.
- Prepare a plan for subsequent design and implementation phases, including major milestones, risk assessment, and milestone criteria.
- Define acceptance criteria for the scoping phase to allows formal sign-off and a smooth transition to design activities.

### Scope
Inclusions
- Definition of Pay in 3 and Pay in 4 rollout boundaries and boundaries between adjacent BNPL capabilities.
- High-level requirements and non-functional considerations that influence design decisions (e.g., performance, reliability, monitoring, and observability at a planning level).
- Identification of interfaces and integration touchpoints with existing BNPL components, described at a high level rather than in implementation detail.
- Data impact considerations, policy constraints, and governance implications relevant to scoping.
- Risk assessment, constraints, and dependency mapping related to the rollout.
- Preliminary timeline, milestones, and resourcing considerations for planning purposes.

Exclusions
- No implementation details, code changes, configuration specifics, or API contracts are included in this scoping artifact.
- No data migration steps, schema changes, or deployment plans are defined within this scope.
- No concrete test plans, acceptance criteria for production features, or operational runbooks are described here.

### Architectural considerations (high level)
The scoping activity will identify, at a high level, how Pay in 3 and Pay in 4 will relate to existing BNPL components. This includes recognizing where payment scheduling, installment calculations, risk assessment inputs, and accounting interactions may intersect with the rollout. Detailed interface contracts, data models, and precise sequencing will be defined in subsequent design work, guided by the scope boundaries established during this planning phase.

### Deliverables
- Scoping document that captures objectives, boundaries, constraints, and high-level requirements for Pay in 3 and Pay in 4 rollout.
- Boundary definitions outlining what is included in the rollout and what is excluded from this planning phase.
- High-level dependency and risk register identifying key risks, mitigations, and external dependencies.
- Preliminary timeline with major milestones to guide subsequent design and implementation activities.
- Summary of anticipated interfaces and data considerations to inform future design work.
- Acceptance criteria for scoping completion, enabling formal sign-off and transition to design.

### Milestones and timeline (high level)
- Initiation and stakeholder alignment
- Boundary and scope definition completion
- Risk and dependency assessment completion
- Review and sign-off of scoping artifact
- Transition to design phase with documented inputs

### Risks, constraints, and assumptions
- Scope creep risk exists if stakeholder requirements are unclear or if parallel BNPL initiatives introduce overlapping capabilities. Clear boundary definitions and sign-off criteria mitigate this risk.
- Dependencies on other planning work items or external governance processes may affect the schedule. Early identification and regular synchronization reduce impact.
- Changes in BNPL policy or regulatory expectations could necessitate scope refinements during downstream design.

### Dependencies
- Alignment with other Pay in 3/4 planning activities and BNPL governance for consistency across the platform.
- Availability of stakeholder representatives for scope validation and sign-off.

### Acceptance criteria for scoping completion
- A formally approved scoping document that clearly defines scope, boundaries, and high-level requirements for Pay in 3 and Pay in 4 rollout.
- Documented risk register, dependency map, and preliminary timeline available for design teams.
- Sign-off from designated stakeholders indicating readiness to proceed to design and implementation phases.

### Next steps
- Initiate design phase with the scoping artifact as input.
- Develop high-level architecture principles and interface considerations to guide detailed design.
- Gather further requirements and, , refine non-functional targets to inform implementation planning.

### Glossary (key terms)
- Pay in 3 / Pay in 4: BNPL rollout capabilities enabling customers to split payments into three or four installments, respectively, as part of the Pepper-Soup BNPL offering.
- BNPL: Buy Now, Pay Later, a model that defers payment for purchases under defined terms.
- Scoping: The activity of defining the boundaries, objectives, constraints, and deliverables for a project or feature rollout, prior to design and implementation.