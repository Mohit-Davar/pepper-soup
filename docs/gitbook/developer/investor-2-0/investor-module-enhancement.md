# Investor Module Enhancement

The Investor Module Enhancement, also referred to as Pepper-Soup, extends the Investor Module to support an intermediate sale workflow for loan accounts. The enhancement introduces a two-tier intermediary state in the asset transfer lifecycle, enabling a sale to be prepared and progressed before the final sale completes. The goal is to provide a controlled, auditable path for asset externalization where the sale has not yet been finalized, while preserving existing final-sale semantics for accounts that complete the process.

This page documents verified technical scope, component responsibilities, processing behavior, and the resulting state transitions that arise from the Pepper-Soup enhancement. It describes how the system now handles intermediary progressions, how COB (close-of-business) processing drives state changes, and how accounting implications follows each status.

> Note: The content below reflects the confirmed product behavior described in the Investor Module 2.0 reference and related materials. It omits internal development details and private artifacts.

## Scope and touched technologies

- Domain model and state space
 - Introduces an extended asset-transfer state machine for investor asset externalization, including the following statuses: Pending-Intermediary, Active-Intermediary, Pending, Active, Decline, Buyback-Intermediary, Buyback.
 - Asset Transfer Records now carry an explicit Asset transfer Status that encodes the current stage of the intermediary and buyer/seller interactions. The statuses are self-describing within the transfer lifecycle.
- APIs and service semantics (high level, domain contracts)
 - New domain service operations support initiating, progressing, and finalizing intermediary sales. Key operations include initiating intermediary sales from an Active loan account, progressing Pending-Intermediary to Active-Intermediary via COB, initiating sale from Active-Intermediary to Pending, and allowing Buyback flows from Active or Active-Intermediary states.
 - Input parameters include a designated intermediary owner identifier for intermediary transfers. The intermediary owner ID is supplied by the user when initiating or progressing intermediary transfers.
- Processing and orchestration
 - COB jobs are responsible for progressing intermediary states: Pending-Intermediary → Active-Intermediary and Pending → Active, as described in the reference flow.
 - The flow enforces the allowed transitions and guards described in the reference implementation: certain transitions are not permitted directly, and some transitions are restricted by the current loan/account state.
- Accounting and GL impact
 - Accounting entries are generated only for Active-stage processing by COB (Active-Intermediary and Active). All other intermediary and pending states generate no accounting entries.
- Validation, persistence, and reporting
 - Validations reflect the documented rules for intermediary and non-intermediary paths, verifying state consistency across transitions and owner changes.
- Migration considerations
 - The reference does not provide explicit DDL or migration scripts. The changes are implemented through the state machine extension and new domain operations; any database-level migration would need to accommodate the new enumerated statuses within the asset transfer records without assuming specific table schemas herein.

## Data model and persistence implications (high level)

The enhancement centers on the asset transfer domain and its status lifecycle. Asset Transfer Records store a status field that expresses the current stage in the intermediary workflow. The following concepts are reflected in the persistence layer:
- Status values: Pending-Intermediary, Active-Intermediary, Pending, Active, Decline, Buyback-Intermediary, Buyback.
- Each status maps to a defined set of accounting or processing actions (for example, whether COB will generate accounting entries).
- When a status change occurs, the system records the Effective From and Effective To timestamps to reflect the transition window for the asset transfer record.

No explicit DDL details are provided in the reference material. If a migration is required in a particular deployment, it should preserve existing balance and activity histories while adding support for the new enumerated statuses and their associated processing rules.

## State machine and transitions (verified flows)

The enhancement defines a lifecycle where an asset transfer can progress through intermediary states before finalization, with explicit guidance on which transitions COB or user actions drive and when accounting entries are generated.

- Pending-Intermediary → Active-Intermediary
 - Triggered by COB processing to advance the intermediary sale into an active intermediary state.
- Pending-Intermediary → Decline
 - COB may decline the intermediary sale if the loan account is closed or overpaid.
- Active-Intermediary → Buyback-Intermediary
 - User initiates a buyback on intermediary assets to revert or finalize the intermediary sale in a Buyback-Intermediary state.
- Active-Intermediary → Pending
 - User can initiate a sale while the asset remains in an intermediary state, moving it toward a Pending state.
- Pending → Active
 - COB processing advances a pending sale to the Active state.
- Active → Decline
 - Decline can occur from the Active-Intermediary path when the user cancels the intermediary sale flow.

Zero-balance handling: If the status changes from Pending to Active while the loan balance is zero, no accounting entries are generated for that transition. However, the asset owner is transferred to the new asset owner, and any future monetary transactions are attributed to the new owner.

Mermaid diagram: state transitions

```mermaid
stateDiagram-v2
 [Pending-Intermediary] --> [Active-Intermediary] : COB progresses
 [Pending-Intermediary] --> [Decline] : Closed or Overpaid
 [Active-Intermediary] --> [Buyback-Intermediary] : Buyback initiated
 [Active-Intermediary] --> [Pending] : Initiate sale from Intermediary
 [Pending] --> [Active] : COB progresses
 [Active-Intermediary] --> [Pending] : Re-initiate flow
 [Pending] --> [Active] : COB progresses
 [Active] --> [Decline] : Decline (through intermediary path)
```

Note: The diagram captures the verified statuses and the directional progression described by the reference materials. It intentionally excludes any states, transitions, or interactions not reflected in the source data.

## Behavioral rules and validations (verified excerpts)

- Initiating intermediary sales
 - A user can initiate an intermediary sale on an active loan account, which creates a Pending-Intermediary status on the asset transfer record and records the intermediary owner ID supplied by the user.
- COB-driven progression
 - The COB job progresses Pending-Intermediary → Active-Intermediary and Pending → Active, as specified by the reference flow.
- Decline scenarios
 - If the loan account is closed or overpaid, the COB may move Pending-Intermediary to Decline. The rule explicitly notes that Pending-Intermediary can be declined under these conditions.
 - From Active-Intermediary, a user-backed decline path is supported by the API, transitioning the status to Decline.
- Buyback and sale on intermediary states
 - A user can move an Active-Intermediary asset to Buyback-Intermediary via API, and can move an Active-Intermediary asset into a Pending state via initiation of a sale on the intermediary path.
 - A Buyback flow is supported for assets in the Active state (Buyback) and for assets in the Active-Intermediary state (Buyback-Intermediary).
- Zero-balance handling during status transition
 - If a Pending-to-Active transition occurs with zero balance, no accounting entries are generated for that transition. Ownership transfer still occurs, and later monetary events are attributed to the new asset owner.

These rules verify state consistency and auditable progression across the intermediary lifecycle.

## Accounting and financial impact (verified behavior)

- No accounting entries for intermediary or pending states
 - Pending-Intermediary, Pending, Buyback-Intermediary, and Buyback states do not produce accounting entries when transitioning or processing.
- Active-state processing
 - When a status enters an Active state (Active-Intermediary or Active), the processing is performed by COB, which may generate the necessary accounting events associated with the active lifecycle. The reference materials specify that these transitions involve COB-driven accounting processing, while intermediary states do not generate entries.

This separation aligns the financial impact with the readiness of the asset for finalization, so that accounting activity occurs only when the asset transfer reaches an operational, finalized state within COB processing.

## API surface and behavior (high-level view)

The enhancement introduces domain-level service capabilities to manage intermediary and final sale flows. While REST or RPC interface details are not published here, the following behavioral contracts are verified at the domain level:
- Initiate intermediary sale from an Active loan increases the asset transfer status to Pending-Intermediary and records the intermediary owner identifier supplied by the user.
- Progression by COB moves Pending-Intermediary → Active-Intermediary and Pending → Active according to the verified rules.
- Buyback operations are available for Active-Intermediary and Active states, moving to Buyback-Intermediary or Buyback respectively, via user actions.
- Initiating a sale from Active-Intermediary moves the intermediary flow toward Pending and, subsequently, Active per the progression rules.
- Decline operations are exposed for cancellation paths from Active-Intermediary and for scenarios where a sale is not completed or is terminated due to business rules.
- Zero-balance transitions are handled with asset ownership changes but without accounting entries for the zero-amount move.

The API surface remains domain-oriented and focuses on the lifecycle transitions and their effects on status, ownership, and accounting, without tying to a particular transport protocol in this publication.

## Open considerations and migration guidance

- Data migration and schema evolution
 - The reference does not provide explicit DDL or migration scripts. Implementations should introduce support for the enumerated statuses in the asset transfer records and verify historical records remain queryable across transitions.
- Observability and reporting
 - Instrumentation should reflect the new statuses and transitions in audit logs and reporting dashboards to support traceability of intermediary sales.
- Interoperability with existing modules
 - The intermediary flow coexists with existing final-sale flows. Integration points should preserve backward compatibility for existing final-sale scenarios and provide clear visibility for accounts in intermediary states.

## Summary

Pepper-Soup, the Investor Module Enhancement, expands the asset externalization capabilities by introducing an intermediary sale lifecycle. The design emphasizes a controlled progression through intermediary states, with COB-driven transitions for Pending-Intermediary and Pending states, explicit ownership updates during zero-balance transitions, and clearly defined accounting behavior that confines ledger activity to Active-state processing. The result is a structured, auditable pathway for asset transfer that precedes final sale, aligning investor workflows with evolving market needs while preserving financial integrity.