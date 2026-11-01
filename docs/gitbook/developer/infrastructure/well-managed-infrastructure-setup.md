# Well-managed infrastructure setup

The enhancement titled Well-managed infrastructure setup provides a single-entry, automated pathway to provision a compliant environment. It adheres to the acceptance criteria that a one-button push initiates environment setup and that account creation is performed in a compliant manner with audit logging. The architectural scope centers on three core capabilities: Terraform-based infrastructure provisioning, identity management (IDM) onboarding, and audit logging to capture compliance-relevant events.

### Scope and primary components
- Terraform-based infrastructure provisioning: A pipeline that orchestrates the creation of cloud and on-premise resources required for a new environment. This component is responsible for applying infrastructure definitions in a repeatable, auditable manner.
- IDM integration: Identity management onboarding and provisioning aligned with the environment setup process. This verifies that accounts and access controls are established in a manner consistent with governance requirements.
- Audit logging: A dedicated subsystem that records relevant actions and events during environment provisioning and account creation to support traceability and compliance.
- Orchestration layer (single-entry point): A new orchestration unit that provides a unified, one-button trigger to kick off the end-to-end provisioning flow across Terraform, IDM, and audit logging.

> Note: The specification notes describe three observable sub-areas (Terraform, IDM, audit logging) as part of the well-managed infrastructure setup scope, with no additional product behavior described beyond the one-button trigger and compliant account creation.

### Architecture and data flow
The well-managed infrastructure setup is realized as an orchestration pathway that coordinates three primary subsystems. The following diagram illustrates the high-level flow and responsibilities:

```mermaid
flowchart TD
 A[User presses the "Set up environment" button] --> B[Orchestration service initiates provisioning]
 B --> C[Terraform provisioning pipeline]
 B --> D[IDM onboarding and provisioning]
 B --> E[Audit logging of actions]
 C --> F[Environment resources created]
 D --> F
 E --> F
 F --> G[Provisioning result returned to user]
```

In this flow, the orchestration layer serves as the single entry point. It triggers the Terraform provisioning pipeline to create the required infrastructure, initiates IDM onboarding for accounts and access controls, and records the provisioning actions in the audit log. When all three subsystems complete, the orchestrator returns the provisioning result to the requester.

### Behavior and sequence of events
1) Trigger: A user action initiates the provisioning sequence via the well-defined one-button flow. The orchestration layer captures this trigger and begins the end-to-end process.
2) Terraform provisioning: The Terraform provisioning pipeline applies the infrastructure definitions to create resources required for the environment. This stage is responsible for provisioning, updating, or initializing the environment according to the defined modules.
3) IDM onboarding: The IDM subsystem provisions or links the necessary identities and access control configurations to verify that accounts exist with standard permissions for the new environment.
4) Audit logging: Each provisioning action and its outcome is recorded by the audit logging subsystem to support traceability and compliance reporting.
5) Completion: The orchestration layer aggregates outcomes from the Terraform, IDM, and audit logging stages and returns a consolidated provisioning result to the requester.

### Data, compliance, and observability
- Audit logging: The account creation and environment provisioning events are captured to support compliance requirements. The audit trail includes the actions executed by the orchestration layer and the results of each subsystem's operations.
- Access control and security: The one-button flow is anchored by governance policies that govern who may initiate environment provisioning and who may view or modify the resulting environment. The exact access control configuration is outside the scope of this documentation but is an integral part of the compliant provisioning path.
- Observability: The provisioning pipeline emits status signals to monitoring and logging systems to supports operational visibility, troubleshooting, and post-incident analysis.

### Implementation scope and verification considerations
- Verified components: Terraform provisioning pipeline, IDM onboarding, and audit logging are identified as the key subsystems involved in this enhancement. These components work in concert under the orchestration layer to deliver the one-button environment setup.
- Behavior expectations: The documented behavior is that a single trigger initiates environment provisioning and account creation with audit logging. No other product behavior is described in the current specification notes.
- Data integrity and reconciliation: The flow verifies that the orchestration layer coordinates the three subsystems to produce a consistent outcome, with audit logs reflecting the sequence of actions and results.

### Security, governance, and operations
- Compliance alignment: Account creation is performed with audit logging to support traceability and governance reporting. The audit log captures provisioning-time events and outcomes.
- Governance controls: Access to initiate the one-button environment setup is governed by organizational policies governing provisioning and access management. The exact policy configuration is outside the scope of this page but is a critical component of the overall well-managed infrastructure setup.
- Operational considerations: The architecture is designed to support repeatable provisioning, with the orchestrator handling the end-to-end flow and the audit log verifying a trustworthy record of actions for compliance needs.

### Related notes
- The specification explicitly identifies three functional areas as part of the well-managed infrastructure setup: Terraform, IDM, and audit logging. It does not document additional product behavior beyond the one-button trigger and compliant account creation.

This page presents the verified behavior and architectural intent for the well-managed infrastructure setup enhancement, focusing on its role as a single-entry provisioning pathway that coordinates Terraform-based infrastructure, IDM onboarding, and audit logging to deliver a compliant environment setup.