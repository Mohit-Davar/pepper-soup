# Loan origination details (Merchant BNPL Checkout Capabilities)

PayPal and merchant partners require the ability to track the loan originator for revenue sharing and reporting purposes. The feature introduces an optional, extensible mechanism to capture and propagate an originator reference at the loan level, with support for multiple originators per loan. Originator data is stored as metadata on the loan, persisted in the system, and exposed to reporting and event streams. The capability is designed to be optional and configurable per tenant, so customers that do not use a merchant originator model are not affected.

### Business value and scope

The primary business objective is to attribute loan income to the originating merchant or channel for revenue sharing and reporting. The Originator ID (also known as Revenue Share ID) is stored on the loan record and propagated through the loan lifecycle. This allows accurate attribution in transaction-level reporting and consolidated financial summaries without altering core loan calculations or revenue mechanics.

Key benefits include:
- Clear attribution of loan income to the originating partner for revenue sharing.
- Availability of originator information in retrieval, events, and reports without changing existing loan business rules.
- Optional module so tenants can opt in or out without impact to non-participating customers.

### Optionality and enabling the feature

The originator capability is optional and can be enabled per tenant. When enabled, originator details may be captured and associated with loans. If the originator data is not provided for a given loan, the originator field remains null, reflecting loans not originated by a participating merchant.

Operationally, there are two related aspects of optionality:
- The originator registry and loan-originator association are themselves optional modules. When disabled, loans behave as before with no originator data.
- The loan creation flow can include originator information only if the tenant has enabled the feature and the global configuration allows creating originators during loan application.

### Concepts and data model (high level)

- Originator registry: a repository of partner records. Each originator has an internal identifier, a unique external identifier (used for reporting), a name, a type, and a channel type. The external identifier is unique within the registry.
- Loan-originator association: a loan can be linked to one or more originators. The system stores the association and makes it available for retrieval, enrichment, and reporting.
- Metadata on loan: the Originator ID is stored as metadata at the loan level, representing the merchant or channel that originated the loan.

Important constraints and notes:
- The Originator ID may be null for loans not originated by large merchants.
- The data model allows multiple originators per loan to accommodate scenarios where more than one party contributes to the loan origination.
- The Originator External ID is the identifier used for reporting and revenue sharing, distinct from the internal system ID.

### Behavioral model and user-facing rules

- Originator Capture during loan creation: When the feature is enabled, the system can accept originator details as part of loan creation. The originator data will be stored on the loan as metadata and tied to the associated originator registry record.
- Persistence: The Originator ID and related originator data are persisted at the loan level within the system and included in the loan’s enriched representations.
- Retrieve loan extension: When requesting a loan with originator associations, the retrieved payload includes the originator list and key fields such as internal and external identifiers, status, and channel/type information.
- Event propagation: The Originator ID is included in applicable loan-related events published by the system, enabling downstream consumers to perform revenue sharing and attribution.
- Reporting extensions: The MerchantOriginator ID appears in the Transaction Summary Report and in the Trial Balance Report to support revenue sharing calculations and partner reporting.

### End-to-end flows

Flow A: Create originator + attach to loan

1. Create an originator in the registry by providing the required external identifier. The system stores the originator and assigns an internal identifier.
2. Create the loan as usual. The loan record is created without any originator data unless you opt to attach one during creation.
3. Attach the originator to the loan. The originator may be attached only while the loan is in the created state (before approval). The operation prevents duplicate attachments.
4. Retrieve the loan with origins. The response includes the originator details associated with the loan.

Flow B: Loan event publication

1. A lifecycle action on the loan (for example, disbursement or repayment) triggers an event publication.
2. The event publisher enriches the event payload with originator data by mapping the loan to its originators in the registry.
3. The enriched event is emitted, allowing downstream consumers to perform revenue sharing calculations and reporting.

Flow C: Reports

1. When reports are generated, the system joins the loan-originator mappings to attach the originator identifiers to the relevant rows.
2. The Transaction Summary Report and the Trial Balance Report include the MerchantOriginator ID, enabling partner-specific revenue reporting.

### Operational procedures and UI guidance

Because this feature is optional, operators will see and interact with originator data only if the tenant has enabled the capability.

1) Creating an originator and attaching to a loan (Flow A)
- In the Originators section of the system, choose to create a new originator and provide the required external identifier. The system will confirm creation and return an internal originator reference.
- Proceed with loan creation as usual. If you intend to attach during loan creation, verify the tenant configuration allows originator creation during loan applications.
- In the loan creation workflow, or afterward, use the Attach Originator action to associate the originator with the loan. The system will validate that the loan is still in the created state and that the originator is not already attached.
- After attachment, retrieve the loan and request originator associations to verify the linkage.

2) Viewing originator data on loans (Flow A output)
- When a loan is retrieved with originator associations, the originator entries appear in the loan’s originators list, including identifiers and channel/type details as stored in the registry.

3) Event publication and downstream consumption (Flow B)
- On loan lifecycle events, the originator data is included in the event payload, enabling downstream systems to compute revenue sharing without additional configuration.

4) Reporting visibility (Flow C)
- When running reports, look for merchant-originator identifiers in the relevant sections of the Transaction Summary Report and the Trial Balance Report to observe revenue attribution.

### Validation, exceptions, and edge cases

- Attach/detach operations are allowed only while the loan is in the created state (i.e., before loan approval).
- An originator cannot be attached to the same loan more than once, and an originator cannot be detached if not already attached.
- The originator registry enforces uniqueness for originator_external_id. If a provided external identifier already exists, the system will use the existing originator depending on configuration.
- If originator type or channel type values are provided, the system validates that the associated code values exist.
- The Originator ID may be null for loans not originated by participating merchants.

### Security, auditing, and governance

Access to originator management and loan-originator associations is controlled by dedicated permissions:
- CREATE_LOAN_ORIGINATOR, UPDATE_LOAN_ORIGINATOR, DELETE_LOAN_ORIGINATOR
- ATTACH_LOAN_ORIGINATOR, DETACH_LOAN_ORIGINATOR

Audit fields accompany originator registry records and loan-originator mappings, and are auto-filled to support traceability.

### End-to-end visualizing diagram (Mermaid)

"""
flowchart TD
 A[Partner creates originator in registry] --> B[Loan created]
 B --> C[Attach originator to loan]
 C --> D[Retrieve loan with originator data]
 D --> E[Loan events published with originator data]
 E --> F[Transaction Summary Report includes merchant originator]
 E --> G[Trial Balance Report includes merchant originator]
"""

### Related concepts terminology

- Originator: a merchant, broker, affiliate, platform, or channel that originated a loan.
- Originator External ID: the external identifier used for reporting and revenue sharing.
- Originator Registry: a stable store for canonical partner records with unique external IDs and type/channel classifications.
- Originator Association: an attachment between a loan and one or more originators.

### What to verify in practice

- Confirm that a loan can carry originator metadata and that retrieval with originator associations returns the correct originator details.
- Confirm that events emitted from loan actions include originator data when the feature is enabled.
- Confirm that reports expose MerchantOriginator ID in the Transaction Summary and Trial Balance outputs.

### Glossary and references

- Originator ID: Identifier used to attribute revenue share to a merchant or partner.
- Revenue share id: alternate term used in the functional description to refer to the Originator External ID used for reporting.

<div class="note">
 <strong>Note:</strong> The originator module is optional. If not enabled for a tenant, loans do not carry originator metadata, and related event enrichment or reporting extensions are not activated.
</div>