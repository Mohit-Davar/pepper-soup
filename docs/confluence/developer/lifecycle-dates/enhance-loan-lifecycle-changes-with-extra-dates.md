<!-- Labels: developer, lifecycle-dates -->
# Loan lifecycle changes with extra dates

This page documents the custom module that records additional business-date details whenever a loan undergoes lifecycle changes. The module monitors loan lifecycle events, stores extra dates for selected status changes, and provides a configurable mechanism to control which statuses are tracked. It is designed to sit alongside the core loan processing components (not altering core lifecycle logic) and to support business reporting and step-tracking that rely on precise business dates associated with status transitions.

### Concept and scope
The component acts as an event-driven listener that reacts to loan lifecycle changes signaled by the system via the domain event LoanStatusChangedBusinessEvent. When such an event occurs, and if the change corresponds to a status code included in the configured set of tracked statuses, the module resolves the actual business date of the change and persists an extra-date record tying the loan, the new status, and the business date together. The stored data is intended to allows downstream reports and business steps that rely on accurate dates for lifecycle transitions, as described in the functional goals of this feature.

The module is explicitly configurable. The configuration key custom.module.loan.lifecycle.allowed.status.codes controls which status changes are recorded. The following values illustrate common usage:

- ALL — Track every status change (default option).
- OVERPAID, CLOSED_OBLIGATIONS_MET — Track specific transitions, such as when a loan is overpaid or when a loan reaches a closed-obligations-met state.

In practice, the trigger for data capture is an on-change event in the loan lifecycle. The design purpose is to allows business-friendly steps and reporting for scenarios like backdated overpayments, where backdated lifecycle changes may not be propagated by the core system without explicit tracking.

### Data model and persistence
The tracked data are stored in a dedicated history construct designed to capture the essentials of a lifecycle change event, while avoiding coupling to core transaction semantics. The record records the following aspects:

- A unique identifier for the history entry.
- A reference to the affected loan.
- The new lifecycle status code observed at the moment of change.
- The business date associated with the status change, i.e., the date that the business context attributes to this change.
- Audit fields indicating who triggered the change and when the record was created or updated.

There are indexed access paths to support common queries:
- A regular index on the status_change_business_date.
- A regular index on the status_code.
- A primary key on the entry identifier.

These characteristics allows efficient retrieval for reporting, reconciliation, and business-step generation that rely on the exact business-date of a status transition.

> Note: The persistence behavior is scoped to recording extra dates for statuses selected by configuration. The core loan processing pipeline remains unchanged in its existing sequencing and validations.

### Core integration and event flow
The core system exposes a domain event when a loan changes status: LoanStatusChangedBusinessEvent. The custom module adds an extra listener for this event. When the event fires, the listener retrieves the actual business date associated with the status change and stores it alongside the loan reference and the new status code. The operation includes audit information (who created or updated the record and the associated timestamps).

Key flow points:
- The event is emitted by the core loan module upon a status transition.
- The custom module listener evaluates whether the new status code is included in the configured set of tracked statuses.
- If tracked, the listener resolves the business date for the change and writes a new history record with the loan reference, status code, business date, and audit fields.
- The stored record is available for business steps and reports that require alignment of lifecycle events with business dates.

### Configuration and behavior details
- Configuration key: custom.module.loan.lifecycle.allowed.status.codes
- Value types: A comma-separated list of status codes, or ALL to track every status change.
- Default behavior (as per documented guidance): ALL.

Example configurations:
- Value = ALL → Track every status change.
- Value = OVERPAID, CLOSED_OBLIGATIONS_MET → Track when the loan is overpaid or when the loan reaches a closed-obligations-met state.

The configuration allows tailoring of the module to the user’s reporting and reconciliation requirements, reducing noise from lifecycle changes that are not relevant to specific business processes.

### Relationship to the core lifecycle and reporting
The feature is designed to augment reporting and business-step generation by attaching precise business dates to selected lifecycle transitions. It does not modify the core lifecycle engine or its validation rules; instead, it records ancillary data to support backdated events and cross-system reporting concerns where CoB (Close of Business) semantics may not automatically propagate backdated changes.

### Domain events and payloads
- Domain event: LoanStatusChangedBusinessEvent
- Trigger: A loan changes its lifecycle status.
- Recorded details: The new status code and the business date of the change, persisted along with loan reference and audit fields, for statuses selected in configuration.

The exact payload structure of LoanStatusChangedBusinessEvent is not specified in this document. The observable effect is that the custom module reacts to the emitted event by persisting the business-date context for the relevant status change when configured to do so.

### REST endpoints and external API contracts
No REST endpoints are described for this feature. The integration model is event-driven and relies on the internal domain event LoanStatusChangedBusinessEvent and the accompanying persistence of extra dates in the dedicated history store.

### Implementation notes and architecture summary
- Component role: A configurable, event-driven listener that records extra dates for loan lifecycle changes.
- Module boundary: Sits alongside the core Fineract loan lifecycle code; does not alter core validation, balance updates, or accrual mechanisms.
- Data integrity: Each history record captures the loan reference, the observed status code, the business date of change, and audit fields. The history store is indexed to support efficient queries by business date and status code.
- Audit trail: Created by, created date/time, updated by, and updated date/time fields verify traceability of history entries.
- Backward compatibility: Since the module does not modify core behavior, existing loan processing and reporting continue to function as before, with the option to opt into enhanced lifecycle-date tracking.

### Example flow (illustrative)
1. A loan’s status changes in the core system (e.g., from ACTIVE to OVERPAID).
2. The LoanStatusChangedBusinessEvent is emitted by the core module.
3. The custom module listener evaluates the change against the configured list of tracked statuses.
4. If tracked, the listener resolves the business date for the change and persists a new history record with the loan reference, new status code, and business date, along with audit fields.
5. Downstream reports and business steps can query the history store to incorporate the extra dates into analyses and reconciliations.

### Visual overview
sequenceDiagram
 participant Core as Fineract Core
 participant Custom as Custom Loan Lifecycle Module
 Core->>Custom: LoanStatusChangedBusinessEvent
 Custom-->>Core: Acknowledgement
 Custom->>DB: Persist history record { loan, status_code, business_date, audit fields }

### Decision history (highlights)
- 2023-12-08 — Decision: Add configuration option to let customers decide which status changes to track in the extra-dates store.
- 2024-03-19 — Decision: The additional lifecycle-date tracking capability will be delivered as part of the community version (no separate custom module requirement).

This page reflects the verified behavior and design guidance documented for the feature as described in the referenced material. It presents the module as an event-driven enhancement designed to capture and persist extra business-date information for selected loan lifecycle changes, configurable by the user, and used to enrich reporting and business steps.