# Write-off functionality for Progressive loans

This epic collects bug tickets and enhancement stories required to support Write-off functionality for Progressive loans and to address contemporary business requirements around write-offs. The objective is to provide a structured program for capturing, prioritizing, and implementing improvements that allows Progressive loan write-offs within the broader write-off workflow.

### Technical summary

The write-off effort for Progressive loans is positioned within the Charge-off, Write-off and Settlement area of the product. The navigation path explicitly places this work item under: Charge-off, Write-off and Settlement → Write-off → Write-off functionality for Progressive loans. The reference description identifies this epic as a collection point for bugs and enhancements related to Progressive loan write-offs, rather than a single, finalized implementation detail. The specification notes indicate the existence of nine child items focused on progressive loan write-off.

### and scope

- Navigation path: Charge-off, Write-off and Settlement > Write-off > Write-off functionality for Progressive loans. This anchors the epic within the broader write-off workflow and confirms its placement in the product's lifecycle.
- Specification notes: 9 children; progressive loan write-off. This indicates the scope comprises nine distinct items or stories related to progressive loan write-off work.
- Audience and classification: Audience — contributor | Classification — feature. This frames the epic as a feature-oriented initiative intended for contributors and backend engineers who participate in the write-off domain.

### Observations and design guarantees

The reference does not provide concrete implementation details such as REST API contracts, event payloads, accounting journal entries, state machines, or specific calculation formulas. As a result, there are no documented design guarantees, algorithms, or processing workflows to reproduce here. This page records the high-level objective and scope as evidenced in the reference, without asserting implementation specifics.

### Next steps (informing future development)

Future iterations should define concrete requirements, including:
- REST endpoints and request/response contracts applicable to Progressive loan write-offs (if described in subsequent specifications).
- Validation guards, preconditions, and error codes specific to progressive loan write-off scenarios.
- Domain events and their payloads, if Progressive write-offs emit events within the loan lifecycle.
- Accounting implications and journal entry patterns (debits/credits) associated with write-off actions for Progressive loans.
- Scheduling or COB batch behaviors that trigger write-off processing and any required replay or recalculation logic.

This page intentionally documents only the verified, high-level scope from the current reference. Detailed behavioral and architectural specifications should be captured in subsequent iterations as they are defined and validated.