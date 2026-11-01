# Asset Externalization in Fineract

Asset externalization is the domain mechanism that models and executes the transfer of loan ownership from an internal asset owner to an external investor. It provides the lifecycle for initiating, approving, settling, and potentially buybacking ownership transfers, while also linking transfer events to accounting journal entries and downstream consumers. The feature is designed around explicit ownership state transitions, settlement timing (end-of-day COB handling), and event emission to allows reporting and integrations with third-party systems. Implementations preserve a clear separation of concerns among loan management, asset ownership metadata, and accounting, while exposing a public API surface to manage transfers, query transfer state, and inspect related journal entries.

### Concepts and boundaries

- Ownership transfer represents a linkage between a loan and an external asset owner, including the transfer’s status, settlement date, and effective date window. The transfer records the externally provided owner identifier and optional sales transaction identifiers, plus a purchase price ratio that expresses the investor’s ownership fraction.
- The system maintains the current and historical state of each transfer, including the linked loan, the external owner, and the transfer’s lifecycle events. A history of journal-entry relationships is kept to support later auditing and reporting.
- On settlement, the system may perform journal entries against the external investor (subject to current design decisions and COB rules). The model anticipates future explicit mappings between journal entries and external ownership, with provisions for ownership snapshots and accounting traces.

### Lifecycle and state machine (-driven)

The asset ownership lifecycle is described by a small set of states and transitions. The primary statuses and their meanings are:

- PENDING: A transfer request has been submitted but has not yet been acted on at COB. This is the initial state after a transfer request is accepted by the system.
- ACTIVE: The transfer is active; ownership is effectively with the external investor, and journal entries are created against the investor .
- BUYBACK: The loan has been bought back by the originator or another designated party; the transfer enters a buyback state.
- DECLINED: A transfer request has been evaluated and declined (for example, the loan balance at settlement is zero or negative, or other rejection rules apply).
- CANCELLED: A transfer request has been cancelled before it was executed.

> Note: The design supports transitions that occur at COB (settlement) and user-initiated cancellations. Current references describe specific COB-driven transitions (ACTIVE or BUYBACK) and rejection/cancellation pathways. See detailed use cases and COB behavior below for exact triggers.

### Eventing: externalization and ownership changes

Two classes of events are described to propagate ownership changes to downstream systems:

- Loan Ownership Transfer Business Event: This event informs external systems about asset ownership changes for a given loan. It extends with values from the existing LoanBusinessEvent and carries fields such as loan identifiers, transfer identifiers, the new AssetOwnerExternalId, currency, and portions of the current balance outstanding. The event is emitted as asset ownership state transitions occur.
- AccountChangedEvent and related accounting snapshot events: These events are described as part of the broader design to surface the business date (settlement date) and a loan snapshot whenever ownership changes occur. The exact payload shapes for these additional events are described as part of the broader event model and are intended to follows the COB and accounting timing.

In addition, the integration layer stores a mapping between journal entries and the external owner, enabling tracing of journal entries to the responsible external investor through the external ownership lifetime.

### REST API surface (evidenced contracts)
The public API surface for asset externalization is defined as follows. The platform exposes a root resource for external asset owners, with sub-resources to manage transfers, fetch transfer data, and inspect journal entries.

- Root endpoint
 - GET /external-asset-owners

- Asset transfer request
 - Target by internal loan id:
 - POST /external-asset-owners/transfers/loans/{loan_id}?command={action}
 - Target by external loan id:
 - POST /external-asset-owners/transfers/loans/external-id/{loan_external_id}?command={action}

- Target loan with id (sale)
 - POST /external-asset-owners/transfers?loanId={loanId}&command=sale
 - Request body (example):
 ```json
 {
 "settlement_date": 2023-05-21,
 "owner_external_id": "1234567890987654321",
 "transfer_external_id": "36efeb06-d835-48a1-99eb-09bd1d348c1e",
 "purchase_price_ratio": 1,
 "dateformat": "yyyy-MM-dd",
 "locale": "en"
 }
 ```
 - Response body (example):
 ```json
 {
 "resourceId": 86,
 "resourceExternalId": "36efeb06-d835-48a1-99eb-09bd1d348c1e",
 "subResourceId": 1,
 "subResourceExternalId": "35462342345234523764",
 "changes": {
 "settlementDate": 2023-05-21,
 "ownerExternalId": "1234567890987654321",
 "transferExternalId": "36efeb06-d835-48a1-99eb-09bd1d348c1e",
 "purchasePriceRatio": 1
 },
 "dateformat": "yyyy-MM-dd",
 "locale": "en"
 }
 ```

- Target loan with external id and request buyback
 - POST /external-asset-owners/transfers?loanExternalId={loanExternalId}&command=buyback
 - Request body mirrors the sale shape, with settlement_date, owner_external_id, transfer_external_id, purchase_price_ratio, dateformat, locale
 - Response body mirrors the sale response structure, with updated transfer details

- Target loan with external id and request cancel
 - POST /external-asset-owners/transfers?loanExternalId={loanExternalId}&command=cancel
 - Request body:
 ```json { "transfer_external_id": "123123123" } ```
 - Response body includes updated status (CANCELLED) and subStatus (USER_REQUESTED)

- Fetch transfer request
 - GET /external-asset-owners/transfers?transferExternalId={transferExternalId}
 - GET /external-asset-owners/transfers?loanId={loanId}
 - GET /external-asset-owners/transfers?loanExternalId={loanExternalId}
 - Response payload exposes totalFilteredRecords and a pageItems array with transfer details (transferId, owner, loan, transferExternalId, settlementDate, status, effectiveFrom/effectiveTo, etc.).

- Fetch transfer journal entries
 - GET /external-asset-owners/transfers/external-id/{ownerExternalId}/journal-entries
 - Response payload includes transferData and journalEntryData with a detailed list of journal entries tied to the transfer and owner.

- Fetch owner journal entries
 - GET /external-asset-owners/owners/external-id/{ownerExternalId}/journal-entries
 - Response payload mirrors the structure used for transfer journal entries, scoped to the given owner.

> These contracts include representative payloads. Exact field names, types, and nested structures conform to the evidenced shapes and are not extended beyond what is shown in the references.

### Validation guards and invariants

- Asset Owner ID: Required for SALE transfers; any non-empty string up to 100 characters. Any string value is allowed in principle, but the field must be provided for sale requests.
- Sales Transaction ID: Optional; any string value up to 100 characters.
- Purchase Price Ratio: Numeric value; required for SALE, represents the ownership percentage (as a fraction, e.g., 1 for 100%).
- Settlement Date: DATE; cannot be in the past; required for SALE and BUYBACK requests.
- Loan status gating: Transfers initiated via the API must target loans with status ACTIVE; other statuses are rejected.
- Response on rejection: If a transfer is REJECTED, the HTTP response is 403 with a reason, per the design guidance.
- Transfer initiation vs. completion: Only the initiation of a transfer is captured by the API; the actual transfer is completed by end-of-day COB processing.

### Use cases (business flows)

- UC1: Initiate asset transfer
 - UC1.1: OK – a sale or buyback transfer can be initiated when preconditions are met.
 - UC1.2: NOK – if there is already a pending request for the loan, the API rejects new initiation.
 - UC1.3: NOK – if the loan balance is closed or overpaid, the transfer is not permitted.

- UC2: Execute asset transfer
 - UC2.1: OK – sale executes; ownership moves according to COB logic.
 - UC2.2: OK – buyback executes; ownership moves according to COB logic.
 - UC2.3: OK – pending transfer and buyback on the same day may be processed; the design contemplates these scenarios with specific COB timing.
 - DEPRECATED: UC2.4 – sale declined due to a closed loan is no longer applicable.

- UC3: Loan got closed
 - UC3.1: OK – buyback can execute when the loan closes.
 - UC3.2: NOK – sale is declined if the loan closes first.
 - UC3.3: NOK – buyback and sale cancellation when the loan closes.

### COB behavior and inline COB scenarios

A key design constraint is how timing interacts with COB processing. The COB step is responsible for applying settlements and updating transfer statuses. The inline COB handling scenario describes that when COB progresses to the next business date, an ACTIVE transfer results in post-settlement journal entries , and loans with remaining balance may proceed to complete the transfer. Conversely, a loan that becomes fully paid or overpaid may cause a DECLINED transition during COB.

### Decision history items (high level)

The design documents capture several decisions about how transfers interact with GL entries and events, including the handling of simultaneous sale and buyback events, and how cancellation interacts with the CO B process. Where explicit governance was recorded, it notes that: sale and buyback on the same day may result in specific handling of GL entries (or cancellations) and that certain events may be emitted to reflect cancellations or status changes. These decisions inform the current behavior and expected system interactions with accounting and external systems.

### Data persistence and auditing (high level)

The persistence design centers on recording the externalization state for each loan, the effective date range for ownership, the transfer’s external identifiers, and the association to the loan and owner. A history of external ownership transfers and a mapping between journal entries and external owners allows auditing across the asset’s lifecycle. A dedicated structure tracks the total outstanding amounts and balance components at the time of transfer, supporting post-hoc reconciliation and reporting. The implementation aims to keep a clear linkage between journal entries and the external owner, enabling traceability in auditing and reporting scenarios.

### Example reference data and calculations context

The system consumes reference data that demonstrates how transfer activity materializes in reporting and balances. For example, transaction summaries include a mix of principal and fees across asset transfer events, while trial balance data illustrates the association of loan balances with asset owner accounts and related receivable accounts. These references illustrate how transfer events translate into real accounting movements and loan balances observed in reporting interfaces.

> Important: All numerical in references remains as presented; no new figures are introduced here. Where calculations or balances are shown, they reflect the exact figures in the reference data, preserving precision and rounding as documented in the source materials.

### Diagram: asset ownership lifecycle (conceptual)

````mermaid
stateDiagram-v2
 [*] --> PENDING
 PENDING --> ACTIVE: COB settlement on balance > 0
 PENDING --> BUYBACK: COB settlement on balance > 0 for buyback
 PENDING --> DECLINED: settlement occurs and balance <= 0
 PENDING --> CANCELLED: user cancels before COB
 ACTIVE --> BUYBACK: buyback executed
 BUYBACK --> [*]: finished
 DECLINED --> [*]: finished
 CANCELLED --> [*]: finished
````

### Summary of responsibilities and interfaces

- Architecture: Asset externalization coordinates loan state, external ownership metadata, and COB-driven accounting interactions. It exposes a REST API surface for initiating transfers, querying transfer state, and inspecting related journal entries. It emits events to inform downstream consumers about ownership changes and related accounting implications.
- Algorithms and processing: The primary algorithmic concerns revolve around transfer validation, settlement timing, and state transitions at COB. The model includes a purchase price ratio, settlement date, and effective-date range to describe ownership economics and validity windows.
- Persistence and accounting: Ownership state, transfer metadata, and related journal-entry links are persisted to allows auditability. The current design plans include a linking model between journal entries and external investors, and the accounting implications (journal entry definitions) are noted as subject to future refinement (documented as Defined in product configuration in certain sections).

### Gaps and testing notes (present-tense)

- Journal entry definitions for asset ownership transfers are Defined in product configuration (GAP).
- AccountChangedEvent payload and related loan account snapshot events are Defined in product configuration (GAP).
- Exact GL date semantics for some scenarios (e.g., same-day sale and buyback) are subject to decision tracker outcomes and may affect GL posting rules (GAP).
- Some explicit data mappings (e.g., internal-to-external ownership relations in accounting) are not fully finalized; reporting queries rely on the current persistence model (GAP).

The material above reflects the evidenced behavior and designs described in the asset externalization feature documentation: the endpoints for initiating and querying transfers, the status flow, the event model for ownership changes, and the COB-driven processing rules. It also incorporates the use cases and test plan glimpsed in the reference materials, including inline COB scenarios and validation rules, to provide a coherent, stand-alone description suitable for backend engineers, system integrators, and contributors.